import fs from 'fs';
import path from 'path';

// File to monitor (update this dynamically as needed)
const TRANSCRIPTION_FILE = path.join('metadata', 'session-1730944234525-transcription.json');

// Memory buffer for unprocessed transcription
let buffer = '';
let lastProcessedTimestamp = 0; // Tracks the timestamp of the last processed content

// Interval for processing the buffer (in milliseconds)
const PROCESS_INTERVAL = 10 * 1000;

// Watch the transcription file for updates
fs.watch(TRANSCRIPTION_FILE, (eventType) => {
  if (eventType === 'change') {
    console.log('File updated, reading new content...');
    handleFileUpdate();
  }
});

// Function to handle file updates
const handleFileUpdate = () => {
  fs.readFile(TRANSCRIPTION_FILE, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading transcription file:', err);
      return;
    }

    try {
      const transcription = JSON.parse(data);
      const { text, timestamp } = transcription;

      // Check if the timestamp is newer than the last processed content
      if (timestamp > lastProcessedTimestamp) {
        const newText = text.substring(buffer.length); // Only new additions
        buffer += newText; // Append new transcription to buffer
        lastProcessedTimestamp = timestamp;

        console.log('Buffered new transcription:', newText);
      }
    } catch (parseError) {
      console.error('Error parsing transcription JSON:', parseError);
    }
  });
};

// Periodic processing of the buffer
setInterval(() => {
  if (buffer.length > 0) {
    console.log('Processing buffered transcription:', buffer);

    // Simulate processing (e.g., update memory or call a function)
    processBuffer(buffer);

    // Clear the buffer after processing
    buffer = '';
  } else {
    console.log('No new transcription to process.');
  }
}, PROCESS_INTERVAL);

// Function to simulate processing the transcription buffer
const processBuffer = (bufferContent) => {
  console.log('Processed content:', bufferContent);

  // Save memory update, call an LLM, or perform other tasks here
};
