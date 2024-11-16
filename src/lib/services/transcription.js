// src/lib/services/transcription.js
import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { OPENAI_API_KEY } from '../../env.js';

export default class TranscriptionService {
  constructor() {
    this.apiKey = OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OpenAI API key is missing');
    }
  }

  async transcribeFile(filePath, sessionId) {
    try {
      console.log('TranscriptionService: Starting transcription for file:', filePath);

      // Validate file exists and has content
      const stats = await fs.promises.stat(filePath);
      console.log('File stats:', stats);
      
      if (stats.size === 0) {
        throw new Error('File is empty');
      }

      // Create form data
      const form = new FormData();
      const fileBuffer = fs.readFileSync(filePath);
      
      // Add file with explicit content type
      form.append('file', fileBuffer, {
        filename: 'audio.webm', // Change to .webm
        contentType: 'audio/webm',
      });

      form.append('model', 'whisper-1');
      form.append('language', 'en');

      console.log('TranscriptionService: Sending request to OpenAI...');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        body: form,
      });

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
        sessionId,
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
