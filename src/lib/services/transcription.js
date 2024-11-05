// src/lib/services/transcription.js
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { OPENAI_API_KEY } from '../../env.js';

export default class TranscriptionService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;

    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing. Please set it in the environment.');
    }
  }

  async transcribeFile(filePath, sessionId) {
    try {
      console.log('TranscriptionService: Starting transcription for file:', filePath);
      
      // Create a form data instance
      const form = new FormData();
      
      // Read the file buffer
      const fileBuffer = fs.readFileSync(filePath);
      
      // Append the file buffer with a filename
      form.append('file', fileBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      
      // Add other required fields
      form.append('model', 'whisper-1');
      form.append('language', 'en');
      
      console.log('TranscriptionService: Preparing request...');
      console.log('Form data fields:', form.getBoundary());

      // Make request to OpenAI API
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        body: form
      });

      console.log('TranscriptionService: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TranscriptionService: Error response:', errorText);
        throw new Error(`Transcription failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('TranscriptionService: Transcription successful');
      
      return {
        text: result.text,
        timestamp: Date.now(),
        sessionId
      };
    } catch (error) {
      console.error('TranscriptionService: Error during transcription:', error);
      throw error;
    }
  }

  // Helper method to validate audio file
  async validateAudioFile(filePath) {
    try {
      const stats = await fs.promises.stat(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      
      console.log(`File size: ${fileSizeInMB.toFixed(2)} MB`);
      
      if (fileSizeInMB > 25) {
        throw new Error('Audio file is too large. Maximum size is 25MB.');
      }

      return true;
    } catch (error) {
      console.error('File validation error:', error);
      throw error;
    }
  }
}