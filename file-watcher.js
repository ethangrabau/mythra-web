import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { generateMemoryPrompt } from './src/lib/services/memoryPrompt.js';
import { generateImagePrompt } from './src/lib/services/generateImagePrompt.js';
import { generateImageFlux } from './src/lib/services/generateImageFlux.js';
import { normalizeSessionId } from './src/lib/utils/session.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI();

// File paths
const transcriptionDir = path.join(__dirname, 'metadata');
const memoryFilePath = path.join(transcriptionDir, 'memory-log.txt');
const imagesDirPath = path.join(__dirname, 'generated_images');

// Ensure required directories exist
if (!fs.existsSync(transcriptionDir)) {
  fs.mkdirSync(transcriptionDir, { recursive: true });
}
if (!fs.existsSync(imagesDirPath)) {
  fs.mkdirSync(imagesDirPath);
}

// Memory structure
let memory = {
  characters: [],
  items: [],
  locations: [],
};

// Track processed chunks by session
//const processedChunks = new Map(); // sessionId -> Set of processed chunkIds

// Load memory
const loadMemory = () => {
  console.log('LOAD MEMORY CALLED');
  console.log('Current memory state before loading:', memory);
  try {
    if (fs.existsSync(memoryFilePath)) {
      const data = fs.readFileSync(memoryFilePath, 'utf-8');
      memory = JSON.parse(data);
      console.log('Memory loaded from file:', memory);
    } else {
      // Initialize empty memory file if it doesn't exist
      const initialMemory = {
        characters: [],
        items: [],
        locations: [],
      };
      saveMemory(JSON.stringify(initialMemory, null, 2));
      memory = initialMemory;
      console.log('Created new memory file with initial state');
    }
  } catch (err) {
    console.error('Error loading memory, starting fresh:', err);
    memory = {
      characters: [],
      items: [],
      locations: [],
    };
  }
  console.log('Final memory state after loading:', memory);
};

// Updated saveMemory function (removed redundant directory check)
const saveMemory = (memoryUpdate) => {
  try {
    console.log('Saving memory to:', memoryFilePath);
    console.log('Memory content:', memoryUpdate);

    // If memoryUpdate is an object, stringify it
    const contentToWrite = typeof memoryUpdate === 'string' 
      ? memoryUpdate 
      : JSON.stringify(memoryUpdate, null, 2);

    fs.writeFileSync(memoryFilePath, contentToWrite);
    console.log('Memory file saved successfully at:', memoryFilePath);
  } catch (err) {
    console.error('Error saving memory:', err);
    console.error('Failed path:', memoryFilePath);
    console.error('Content type:', typeof memoryUpdate);
    console.error('Error details:', err.message);
  }
};

const resetMemory = () => {
  // Reset the memory variable to initial state
  memory = {
    characters: [],
    items: [],
    locations: [],
  };
  // Force save the empty state to file
  saveMemory(JSON.stringify(memory, null, 2));
  // Force reload the memory from file
  loadMemory();
  console.log('Memory reset to initial state');
};

// Process new transcription with context
const processTranscriptionData = async (transcriptionData) => {
  const { transcriptions, sessionId } = transcriptionData;
  const normalizedSessionId = normalizeSessionId(sessionId);
  
  // Get the latest transcription
  const newTranscription = transcriptions[transcriptions.length - 1];

  if (!newTranscription) return; // Nothing new to process
  
  // Get recent context (last 3 transcriptions before the new one)
  const recentContext = transcriptions
    .slice(-4, -1) // Get up to 3 previous transcriptions
    .map(t => t.text)
    .join(' ');

  console.log('Processing new transcription:', {
    text: newTranscription.text,
    context: recentContext,
    sessionId: normalizedSessionId,
  });

  try {
    // 1. Generate image first (for lower latency)
    console.log('Generating image prompt...');
    const imagePrompt = await generateImagePrompt(
      newTranscription.text, 
      recentContext,
      memory
    );
    if (imagePrompt) {
      console.log('Image prompt received:', imagePrompt);
      const imagePath = await generateImageFlux(imagePrompt, normalizedSessionId);
      if (imagePath) {
        console.log(`Image generated and saved at: ${imagePath}`);
      }
    }

    // 2. Update memory after image generation
    const prompt = generateMemoryPrompt(newTranscription.text, memory, recentContext);
    console.log('Calling LLM for memory updates...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const updatedMemory = response.choices[0]?.message?.content;
    if (updatedMemory) {
      console.log('Received memory update:', updatedMemory);
      try {
        memory = JSON.parse(updatedMemory);
        saveMemory(JSON.stringify(memory, null, 2));
        console.log('Memory state updated:', memory);
      } catch (err) {
        console.error('Error parsing memory update:', err);
      }
    }
  } catch (error) {
    console.error('Error processing transcription:', error);
  }
};

const startFileWatcher = () => {
  console.log('Starting file watcher...');
  loadMemory();

  console.log('Watching directory for transcription changes:', transcriptionDir);
  fs.watch(transcriptionDir, (eventType, filename) => {
    if (filename && filename.endsWith('-transcription.json')) {
      const filePath = path.join(transcriptionDir, filename);

      fs.readFile(filePath, 'utf-8', async (err, data) => {
        if (err) {
          console.error(`Error reading transcription file ${filename}:`, err);
          return;
        }

        try {
          const transcriptionData = JSON.parse(data);
          if (transcriptionData.transcriptions?.length > 0) {
            await processTranscriptionData(transcriptionData);
          }
        } catch (err) {
          console.error('Error processing transcription file:', err);
        }
      });
    }
  });
};

export const fileWatcher = {
  start: startFileWatcher,
  resetMemory: resetMemory,
};