import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules, you need to resolve `__dirname`
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionId = 'session-1730945117189'; // Replace with the current session ID
const transcriptionFilePath = path.join(__dirname, 'metadata', `${sessionId}-transcription.json`);
let lastProcessedText = ''; // Store previously processed transcription

console.log(`Monitoring transcription file: ${transcriptionFilePath}`);

// Function to process new transcription
const processNewTranscription = (newText) => {
  console.log(`Processing new transcription: ${newText}`);
  // Add logic for processing with memory generation here
};

// Function to check for updates
const checkForUpdates = () => {
  fs.readFile(transcriptionFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading transcription file:', err);
      return;
    }

    try {
      const transcriptionData = JSON.parse(data);

      if (!transcriptionData.text) {
        console.log('No transcription text found in the file.');
        return;
      }

      const fullText = transcriptionData.text.trim();

      // Check if there are new updates
      if (fullText !== lastProcessedText) {
        const newText = fullText.slice(lastProcessedText.length).trim();
        lastProcessedText = fullText; // Update the processed text
        if (newText) {
          console.log(`Detected new transcription: ${newText}`);
          processNewTranscription(newText);
        } else {
          console.log('No new transcription text to process.');
        }
      } else {
        console.log('No new transcription to process.');
      }
    } catch (parseError) {
      console.error('Error parsing transcription file:', parseError);
    }
  });
};

// Poll for updates every 30 seconds
setInterval(checkForUpdates, 10000);
