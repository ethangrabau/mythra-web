import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { generateMemoryPrompt } from './src/lib/services/memoryPrompt.js';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI setup
const openai = new OpenAI(); // Automatically uses OPENAI_API_KEY

// File paths
const sessionId = process.env.TEST_MODE ? 'session-test' : 'session-12345';
const transcriptionFilePath = path.join(__dirname, 'metadata', `${sessionId}-transcription.json`);
const memoryFilePath = path.join(__dirname, 'metadata', 'memory-log.txt');

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

// LLM Call
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
  

// Process transcription
const processNewTranscription = async (newText) => {
    console.log(`Processing transcription chunk: ${newText}`);
  
    // Call LLM for memory updates
    const updatedMemory = await callLLM(newText);
  
    if (updatedMemory) {
      console.log('Memory update received from LLM:', updatedMemory);
  
      // Save the raw memory update directly
      try {
        saveMemory(updatedMemory);
        memory = { ...memory, raw: updatedMemory }; // Optionally store the latest raw update
        console.log('Memory updated successfully.');
      } catch (error) {
        console.error('Error saving raw memory update:', error);
      }
    } else {
      console.warn('No update received from LLM.');
    }
  };
  

// Monitor transcriptions
const checkForUpdates = () => {
  fs.readFile(transcriptionFilePath, 'utf-8', (err, data) => {
    if (err) return console.error('Error reading transcription file:', err);

    try {
      const transcriptionData = JSON.parse(data);
      const transcriptionChunks = transcriptionData.text || [];

      transcriptionChunks.forEach((chunk) => {
        const newText = chunk.text.trim();
        if (newText && !memory.processedChunks.includes(newText)) {
          memory.processedChunks.push(newText);
          processNewTranscription(newText);
        } else {
          console.log('No new transcription chunks to process.');
        }
      });
    } catch (err) {
      console.error('Error parsing transcription file:', err);
    }
  });
};

// Initialize
loadMemory();
setInterval(checkForUpdates, 10000);
