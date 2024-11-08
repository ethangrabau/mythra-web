// src/lib/test/test-transcription.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import TranscriptionService from '../services/transcription.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testTranscription() {
  try {
    console.log('Starting transcription test...');
    
    const transcriptionService = new TranscriptionService();
    
    // Log the API key (first few characters only)
    const apiKeyPreview = transcriptionService.apiKey ? 
      `${transcriptionService.apiKey.substring(0, 5)}...` : 
      'not found';
    console.log('API Key preview:', apiKeyPreview);

    // Test file path
    const testFilePath = path.join(__dirname, '../../../recordings/test-audio.webm');

    // Check if file exists and log details
    const stats = fs.statSync(testFilePath);
    console.log('Test file stats:', {
      path: testFilePath,
      size: `${(stats.size / 1024).toFixed(2)} KB`,
      exists: fs.existsSync(testFilePath),
      lastModified: stats.mtime
    });

    // Validate file
    await transcriptionService.validateAudioFile(testFilePath);

    // Read first few bytes to verify it's a WebM file
    const buffer = (await fs.readFile(testFilePath)).slice(0, 4);
    console.log('File header:', buffer.toString('hex'));
    
    // Attempt transcription
    console.log('Attempting transcription...');
    const result = await transcriptionService.transcribeFile(testFilePath, 'test-session');

    console.log('Transcription successful!');
    console.log('Result:', result);

    return result;
  } catch (error) {
    console.error('Transcription test failed:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    throw error;
  }
}

// Run the test
testTranscription()
  .then(() => {
    console.log('Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });