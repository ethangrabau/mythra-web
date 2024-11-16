import fs from 'fs/promises';
import path from 'path';
import TranscriptionService from './src/lib/services/transcription.js';

const TEST_DIRECTORY = '/Users/ethangrabau/Documents/mythra-web/test-chunks'; // Replace with the actual session ID

(async () => {
  try {
    // Initialize transcription service
    const transcriptionService = new TranscriptionService(); // Ensure this matches your service initialization

    // Read all files in the test directory
    const files = await fs.readdir(TEST_DIRECTORY);

    // Filter for .webm files
    const audioFiles = files.filter(file => file.endsWith('.webm'));

    console.log(`Found ${audioFiles.length} audio files for testing`);

    for (const file of audioFiles) {
      const filePath = path.join(TEST_DIRECTORY, file);

      console.log(`Testing transcription for file: ${filePath}`);

      try {
        // Run transcription
        const transcription = await transcriptionService.transcribeFile(filePath);

        console.log(`Transcription result for ${file}:`, transcription);
      } catch (error) {
        console.error(`Error transcribing file ${file}:`, error.message);
      }
    }
  } catch (err) {
    console.error('Error during testing:', err);
  }
})();
