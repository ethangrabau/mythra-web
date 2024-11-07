import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transcription file path (Replace sessionId with your current one)
const sessionId = 'session-1730946316630'; // Update this as needed
const transcriptionFilePath = path.join(__dirname, 'metadata', `${sessionId}-transcription.json`);

// Memory file path
const memoryFilePath = path.join(__dirname, 'metadata', 'memory.json');

// Memory structure
let memory = {
  recentActivity: "", // Running buffer of recent transcriptions
};

// Load existing memory or initialize a new one
const loadMemory = () => {
  try {
    if (fs.existsSync(memoryFilePath)) {
      const data = fs.readFileSync(memoryFilePath, 'utf-8');
      memory = JSON.parse(data);
      console.log('Memory loaded:', memory);
    } else {
      console.log('No existing memory file. Initializing new memory.');
    }
  } catch (err) {
    console.error('Error loading memory:', err);
  }
};

// Save memory to file
const saveMemory = () => {
  try {
    fs.writeFileSync(memoryFilePath, JSON.stringify(memory, null, 2));
    console.log('Memory saved to file.');
  } catch (err) {
    console.error('Error saving memory:', err);
  }
};

// Update memory with new transcription text
const updateMemory = (newText) => {
  console.log('Updating memory with new text:', newText);

  // Append new text to recentActivity
  memory.recentActivity += ` ${newText}`.trim();

  // Trim recentActivity to a maximum character limit (e.g., 1000 characters)
  const maxChars = 1000;
  if (memory.recentActivity.length > maxChars) {
    memory.recentActivity = memory.recentActivity.slice(-maxChars);
  }

  // Save updated memory to file
  saveMemory();
};

// Function to process new transcription
const processNewTranscription = (newText) => {
  console.log(`Processing new transcription: ${newText}`);
  updateMemory(newText); // Pass new transcription to memory update
};

// Initialize memory at startup
loadMemory();

// File watcher to check for transcription updates
let lastProcessedLength = 0; // Store previously processed transcription

const checkForUpdates = () => {
    fs.readFile(transcriptionFilePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading transcription file:', err);
        return;
      }
  
      try {
        const transcriptionData = JSON.parse(data);
        const fullText = transcriptionData.text.trim(); // Full transcription text
        const newLength = fullText.length;
  
        // Check if there is new text to process
        if (newLength > lastProcessedLength) {
          const newText = fullText.slice(lastProcessedLength); // Extract the new portion
          console.log('File updated, reading new content...');
          console.log(`New transcription detected: ${newText}`);
  
          lastProcessedLength = newLength; // Update the last processed length
          processNewTranscription(newText); // Process only the new portion
        } else {
          console.log('No new transcription to process.');
        }
      } catch (parseError) {
        console.error('Error parsing transcription file:', parseError);
      }
    });
  };

// Poll the file for updates every 30 seconds
setInterval(checkForUpdates, 10000);

console.log(`Monitoring transcription file: ${transcriptionFilePath}`);
