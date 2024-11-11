// src/lib/services/transcription.js
import OpenAI from 'openai';
import fs from 'fs';

class TranscriptionService {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async transcribeFile(filePath, sessionId) {
    try {
      const response = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        response_format: 'verbose_json',
        language: 'en'
      });

      return {
        text: response.text,
        timestamp: Date.now(),
        sessionId
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
}

export default TranscriptionService;
