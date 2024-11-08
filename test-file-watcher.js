import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transcription file path (Simulated for testing)
const sessionId = 'session-test';
const transcriptionFilePath = path.join(__dirname, 'metadata', `${sessionId}-transcription.json`);

// Create or update the transcription file with a chunk
const createTranscriptionFile = (content) => {
    try {
      fs.writeFileSync(
        transcriptionFilePath,
        JSON.stringify({ text: content }, null, 2) // Match expected JSON structure
      );
      console.log(`Transcription file updated with content: "${content}"`);
    } catch (err) {
      console.error('Error creating transcription file:', err);
    }
  };

// Simulate feeding transcriptions into the system
const simulateTranscriptions = async () => {
  console.log('Starting transcription simulation...');
  const transcriptions = [
    { chunkId: 1, text: 'Bruce, the Goliath warrior, picks up a glowing sword.' },
    { chunkId: 2, text: 'Todd, the radiant Asmere Paladin, studies an ancient map.' },
    { chunkId: 3, text: 'The companions arrive at a mysterious cave covered in moss.' },
    { chunkId: 4, text: 'A goblin ambushes them as they enter the dark cave.' },
  ];

  let currentTranscriptions = [];

  for (let i = 0; i < transcriptions.length; i++) {
    currentTranscriptions.push(transcriptions[i]);
    console.log(`Feeding transcription ${i + 1}: ${transcriptions[i].text}`);
    createTranscriptionFile(currentTranscriptions);

    // Wait for the file watcher to process the transcription
    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10-second delay
  }

  console.log('Finished transcription simulation.');
};

simulateTranscriptions();
