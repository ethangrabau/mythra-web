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

// Process memory and generate image based on saved transcription
const processTranscriptionData = async (transcriptionData) => {
  const { text, sessionId } = transcriptionData;
  const normalizedSessionId = normalizeSessionId(sessionId);

  console.log('Processing memory and images for:', {
    text,
    sessionId: normalizedSessionId,
  });

  const recentActivity = memory.processedChunks.slice(-5).join(' ');

  // Only handle memory and image generation, NOT transcription
  try {
    // 1. Update memory
    const prompt = generateMemoryPrompt(text, memory);
    console.log('Calling LLM for memory updates...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const updatedMemory = response.choices[0]?.message?.content;
    if (updatedMemory) {
      saveMemory(updatedMemory);
      memory = { ...memory, raw: updatedMemory };
      console.log('Memory updated successfully.');
    }

    // 2. Generate image if needed
    console.log('Generating image prompt...');
    const imagePrompt = await generateImagePrompt(text, recentActivity, memory);
    if (imagePrompt) {
      console.log('Image prompt received:', imagePrompt);
      const imagePath = await generateImageFlux(imagePrompt, normalizedSessionId);
      if (imagePath) {
        console.log(`Image generated and saved at: ${imagePath}`);
      }
    }
  } catch (error) {
    console.error('Error processing memory/image:', error);
  }
};

const processedFiles = new Set(); // Track already-processed files

const startFileWatcher = () => {
  console.log('Starting file watcher...');
  loadMemory();

  console.log('Watching directory for transcription changes:', transcriptionDir);
  fs.watch(transcriptionDir, (eventType, filename) => {
    if (filename && filename.endsWith('-transcription.json')) {
      const filePath = path.join(transcriptionDir, filename);

      // Skip if already processed
      if (processedFiles.has(filePath)) {
        return; // File already processed, skip
      }

      fs.readFile(filePath, 'utf-8', async (err, data) => {
        if (err) {
          console.error(`Error reading transcription file ${filename}:`, err);
          return;
        }

        try {
          const transcriptionData = JSON.parse(data);

          const { transcriptions = [] } = transcriptionData;
          const latestTranscription = transcriptions[transcriptions.length - 1];
          if (latestTranscription?.text) {
            await processTranscriptionData({
              text: latestTranscription.text,
              sessionId: transcriptionData.sessionId,
            });

            // Mark file as processed
            processedFiles.add(filePath);
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
};
