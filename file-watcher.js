import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { generateMemoryPrompt } from './src/lib/services/memoryPrompt.js';
import { generateImagePrompt } from './src/lib/services/generateImagePrompt.js'; // Assuming this exists
import { generateImageFlux } from './src/lib/services/generateImageFlux.js'; // Flux API handler

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI setup
const openai = new OpenAI(); // Automatically uses OPENAI_API_KEY

// File paths
const sessionId = process.env.TEST_MODE ? 'session-test' : 'session-12345';
const transcriptionFilePath = path.join(__dirname, 'metadata', `${sessionId}-transcription.json`);
const memoryFilePath = path.join(__dirname, 'metadata', 'memory-log.txt');
const imagesDirPath = path.join(__dirname, 'generated_images');

// Ensure images directory exists
if (!fs.existsSync(imagesDirPath)) {
  fs.mkdirSync(imagesDirPath);
}

// Memory structure
let memory = {
  characters: [],
  items: [],
  locations: [],
  processedChunks: [],
};

// Load memory
const loadMemory = () => {
  try {
    if (fs.existsSync(memoryFilePath)) {
      const data = fs.readFileSync(memoryFilePath, 'utf-8');
      memory = JSON.parse(data);
      console.log('Memory loaded:', memory);
    }
  } catch (err) {
    console.error('Error loading memory, starting fresh:', err);
  }
};

// Save memory
const saveMemory = (memoryUpdate) => {
  try {
    fs.writeFileSync(memoryFilePath, memoryUpdate);
    console.log('Memory updated successfully.');
  } catch (err) {
    console.error('Error saving memory:', err);
  }
};

// LLM Call for memory updates
const callLLM = async (transcription) => {
  const prompt = generateMemoryPrompt(transcription, memory);
  try {
    console.log('Calling LLM for memory updates...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const updatedMemory = response.choices[0]?.message?.content;
    if (!updatedMemory) throw new Error('Empty LLM response.');
    console.log('LLM Response:', updatedMemory);
    return updatedMemory; // Return full memory as-is
  } catch (error) {
    console.error('Error during LLM call:', error);
    return null;
  }
};

// LLM Call for image generation prompts
const callImagePromptLLM = async (newText, recentActivity) => {
    try {
      console.log('Calling LLM for image prompt...');
  
      // Generate the prompt for the LLM using the generateImagePrompt function
      const imagePrompt = await generateImagePrompt(newText, recentActivity, memory);
  
      if (!imagePrompt) {
        console.log('No image prompt generated as per LLM response.');
        return null; // No image needed
      }
  
      console.log('Image Prompt LLM Response:', imagePrompt);
      return imagePrompt; // Return the valid image prompt
    } catch (error) {
      console.error('Error generating image prompt:', error.message);
      return null; // Gracefully handle errors by returning null
    }
  };  

// Process transcription
const processNewTranscription = async (newText, sessionId) => {
  console.log(`Processing transcription chunk for session ${sessionId}: ${newText}`);

  // Call LLM for memory updates
  const updatedMemory = await callLLM(newText);

  if (updatedMemory) {
    console.log('Memory update received from LLM:', updatedMemory);

    try {
      saveMemory(updatedMemory);
      memory = { ...memory, raw: updatedMemory };
      console.log('Memory updated successfully.');
    } catch (error) {
      console.error('Error saving raw memory update:', error);
    }

    const recentActivity = memory.processedChunks.slice(-5).join(' ');
    const imagePrompt = await callImagePromptLLM(newText, recentActivity);

    // New logging to debug the prompt
    console.log('Image generation decision:', imagePrompt === null ? 'No image needed' : 'Generate image');
    if (imagePrompt) {
      console.log('Final image prompt:', imagePrompt);
    }

    if (imagePrompt && imagePrompt.toLowerCase() !== 'no image needed') {
      console.log('Generating image with Flux...');
      const imagePath = await generateImageFlux(imagePrompt, sessionId);

      if (imagePath) {
        console.log(`Image generated and saved at: ${imagePath}`);
      } else {
        console.warn('Image generation failed.');
      }
    } else {
      console.log('No image generated as per LLM response.');
      return; // Add early return to prevent further processing
    }
  } else {
    console.warn('No update received from LLM.');
  }
};

// Monitor transcriptions
const checkForUpdates = () => {
  console.log('=== Checking for updates ===');
  fs.readdir(path.join(__dirname, 'metadata'), (err, files) => {
    if (err) {
      console.error('Error reading metadata directory:', err);
      return;
    }

    console.log('Found files in metadata directory:', files);

    // Find transcription files
    const transcriptionFiles = files.filter(file => file.endsWith('-transcription.json'));
    console.log('Found transcription files:', transcriptionFiles);

    transcriptionFiles.forEach(file => {
      // Extract session ID from filename
      const sessionId = file.replace('-transcription.json', '');
      const filePath = path.join(__dirname, 'metadata', file);
    
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error(`Error reading transcription file ${file}:`, err);
          return;
        }
    
        try {
          console.log('Processing transcription for session:', sessionId);
          const transcriptionData = JSON.parse(data);
          const text = transcriptionData.text?.trim();
    
          // Only process if we have text and haven't processed it before
          if (text && !memory.processedChunks.includes(text)) {
            console.log('Found new text to process:', text);
            memory.processedChunks.push(text);
            processNewTranscription(text, sessionId);
          } else {
            console.log('No new text to process for session:', sessionId);
          }
        } catch (err) {
          console.error('Error parsing transcription file:', err);
        }
      });
    });
  });
};

export const fileWatcher = {
  start: () => {
    console.log('Starting file watcher...');
    loadMemory();
    setInterval(checkForUpdates, 10000);
  }
};