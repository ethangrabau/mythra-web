// src/lib/services/audioSession.js
import fs from 'fs/promises';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import crypto from 'crypto';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root project directory (2 levels up from services folder)
const PROJECT_ROOT = join(__dirname, '..', '..');

const AUDIO_DIR = join(PROJECT_ROOT, 'audio-chunks');
const RECORDINGS_DIR = join(PROJECT_ROOT, 'recordings');
const METADATA_DIR = join(PROJECT_ROOT, 'metadata');

// Ensure necessary directories exist
mkdirSync(AUDIO_DIR, { recursive: true });
mkdirSync(RECORDINGS_DIR, { recursive: true });
mkdirSync(METADATA_DIR, { recursive: true });

export class AudioSession {
  constructor(sessionId, transcriptionService) {
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.chunks = new Map();
    this.status = 'initializing';
    this.transcriptionService = transcriptionService;
    this.socket = null;
    this.metadata = {
      totalDuration: 0,
      totalSize: 0,
      lastChunkId: -1,
      checksums: new Set(),
      transcriptions: []
    };
  }

  setSocket(socket) {
    this.socket = socket;
  }

  sendStatus(message) {
    if (this.socket) {
      this.socket.send(JSON.stringify({
        type: 'status',
        payload: { message, status: this.status },
        timestamp: Date.now(),
        sessionId: this.sessionId
      }));
    }
  }

  sendError(message) {
    if (this.socket) {
      this.socket.send(JSON.stringify({
        type: 'error',
        payload: { message },
        timestamp: Date.now(),
        sessionId: this.sessionId
      }));
    }
  }

  async addChunk(chunkId, data) {
    try {
      // Skip null or empty data
      if (!data || data.length === 0) {
        console.warn(`Skipped null or empty chunk with ID: ${chunkId}`);
        return null; // Don't process this chunk further
      }
  
      const calculatedChecksum = crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');
      if (this.metadata.checksums.has(calculatedChecksum)) {
        throw new Error('Duplicate chunk detected');
      }
  
      // Create session directory if it doesn't exist
      const sessionDir = join(AUDIO_DIR, this.sessionId);
      console.log('Creating session directory at:', sessionDir);
      await fs.mkdir(sessionDir, { recursive: true });
  
      // Save the chunk
      const chunkPath = join(sessionDir, `chunk-${chunkId}.webm`);
      console.log('Saving chunk to:', chunkPath);
      await fs.writeFile(chunkPath, data);
  
      // Add chunk info
      this.chunks.set(chunkId, { 
        path: chunkPath, 
        size: data.length,
        timestamp: Date.now(),
      });
  
      // Update metadata
      this.metadata.lastChunkId = chunkId;
      this.metadata.checksums.add(calculatedChecksum);
      this.metadata.totalSize += data.length;
      this.metadata.totalDuration += 3000; // Assuming a 3-second chunk duration
  
      await this.saveMetadata();
      return this.chunks.get(chunkId);
    } catch (error) {
      console.error(`Error processing chunk ${chunkId}:`, error);
      throw error;
    }
  }  

  async saveMetadata() {
    const metadataPath = join(METADATA_DIR, `${this.sessionId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(this.metadata, null, 2));
  }

  async transcribeChunk(chunk, chunkId) {
    try {
      console.log(`Transcribing chunk ${chunkId} at path: ${chunk.path}`);
      const transcription = await this.transcriptionService.transcribeFile(chunk.path, this.sessionId);
      
      // Add chunk metadata to transcription
      const enhancedTranscription = {
        ...transcription,
        chunkId,
        timestamp: chunk.timestamp || Date.now()
      };

      return enhancedTranscription;
    } catch (error) {
      console.error(`Error transcribing chunk ${chunkId}:`, error);
      return null;
    }
  }

  async finalize() {
    try {
      this.status = 'transcribing';
      this.sendStatus('Transcribing audio chunks...');

      const transcriptions = [];

      // Process each chunk's transcription
      for (let i = 0; i <= this.metadata.lastChunkId; i++) {
        const chunk = this.chunks.get(i);
        if (!chunk) {
          console.warn(`Missing chunk ${i} during finalization`);
          continue;
        }

        const transcription = await this.transcribeChunk(chunk, i);
        if (transcription) {
          transcriptions.push(transcription);
        }
      }

      // Save transcriptions file
      const transcriptionPath = join(METADATA_DIR, `${this.sessionId}-transcription.json`);
      const transcriptionData = {
        sessionId: this.sessionId,
        lastUpdated: Date.now(),
        transcriptions
      };

      await fs.writeFile(transcriptionPath, JSON.stringify(transcriptionData, null, 2));
      
      this.metadata.transcriptions = transcriptions;
      this.status = 'completed';
      await this.saveMetadata();

      this.sendStatus('Transcription completed');
      
      return { 
        sessionId: this.sessionId,
        transcriptions
      };
    } catch (error) {
      this.status = 'error';
      this.sendError(`Transcription failed: ${error.message}`);
      console.error('Error in finalize:', error);
      throw error;
    }
  }
}