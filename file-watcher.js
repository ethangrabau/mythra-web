import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { generateMemoryPrompt } from './src/lib/services/memoryPrompt.js';
import { generateImagePrompt } from './src/lib/services/generateImagePrompt.js';
import { generateImageFlux } from './src/lib/services/generateImageFlux.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI setup
const openai = new OpenAI(); // Automatically uses OPENAI_API_KEY

// File paths
const transcriptionDir = path.join(__dirname, 'metadata');
const memoryFilePath = path.join(transcriptionDir, 'memory-log.txt');
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

// Call LLM for memory updates
const updateMemory = async (transcription) => {
  const prompt = generateMemoryPrompt(transcription, memory);
  try {
    console.log('Calling LLM for memory updates...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const updatedMemory = response.choices[0]?.message?.content;
    if (!updatedMemory) throw new Error('Empty LLM response.');

    console.log('Memory update received:', updatedMemory);
    saveMemory(updatedMemory);
    memory = { ...memory, raw: updatedMemory };
    console.log('Memory updated successfully.');
  } catch (error) {
    console.error('Error during memory update:', error);
  }
};

// Call LLM for image prompts
const generateImage = async (newText, recentActivity, sessionId) => {
  try {
    console.log('Generating image prompt...');
    const imagePrompt = await generateImagePrompt(newText, recentActivity, memory);
    if (!imagePrompt) {
      console.log('No image prompt generated.');
      return;
    }

    console.log('Image prompt received:', imagePrompt);
    const imagePath = await generateImageFlux(imagePrompt, sessionId);
    if (imagePath) {
      console.log(`Image generated and saved at: ${imagePath}`);
    } else {
      console.warn('Image generation failed.');
    }
  } catch (error) {
    console.error('Error generating image:', error);
  }
};

// Process transcription
const processTranscription = async (newText, sessionId) => {
  console.log(`Processing transcription for session ${sessionId}: ${newText}`);
  const recentActivity = memory.processedChunks.slice(-5).join(' ');

  // Immediately update memory
  updateMemory(newText);

  // Start image generation in parallel
  generateImage(newText, recentActivity, sessionId);

  // Mark the chunk as processed
  memory.processedChunks.push(newText);
};

// Watch for transcription file changes
const startFileWatcher = () => {
  console.log('Starting file watcher...');
  loadMemory();

  console.log('Watching directory for transcription changes:', transcriptionDir);
  fs.watch(transcriptionDir, (eventType, filename) => {
    if (filename && filename.endsWith('-transcription.json')) {
      const filePath = path.join(transcriptionDir, filename);

      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error(`Error reading transcription file ${filename}:`, err);
          return;
        }

        try {
          const transcriptionData = JSON.parse(data);
          const text = transcriptionData.text?.trim();

          // Only process new text
          if (text && !memory.processedChunks.includes(text)) {
            console.log('New transcription found:', text);
            processTranscription(text, filename.replace('-transcription.json', ''));
          } else {
            console.log('No new transcription to process for file:', filename);
          }
        } catch (err) {
          console.error('Error parsing transcription file:', err);
        }
      });
    }
  });
};

export const fileWatcher = {
  start: startFileWatcher,
};
