// src/lib/services/audioSession.js
import { PATHS } from '../constants/paths.js';
import fs from 'fs/promises';
import { mkdirSync } from 'fs';
import { join } from 'path';

import { RecordingService } from './recordingService.js';

// Fix for __dirname in ES modules

// Get root project directory (2 levels up from services folder)
const { AUDIO_DIR, RECORDINGS_DIR, METADATA_DIR } = PATHS;

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
    this._processedChunks = new Set();  // Add this line
    this.metadata = {
      totalDuration: 0,
      totalSize: 0,
      lastChunkId: -1,
      checksums: new Set(),
      transcriptions: []
    };
    
    this.recordingService = new RecordingService();
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

  async startRecording() {
    try {
      this.status = 'recording';
      this.sendStatus('Starting recording...');
  
      // Start recording with callback for completed chunks
      this.recordingService.startRecording(this.sessionId, async (sessionId, chunkId, filePath) => {
        try {
          // Read the chunk file
          const data = await fs.readFile(filePath);
          
          // Process the chunk (which handles transcription)
          await this.processChunk(chunkId, data);
          
          // Send acknowledgment to client
          if (this.socket) {
            this.socket.send(JSON.stringify({
              type: 'ack',
              payload: { chunkId },
              sessionId: this.sessionId,
              timestamp: Date.now()
            }));
          }
        } catch (error) {
          console.error(`Error processing chunk ${chunkId}:`, error);
          this.sendError(`Error processing chunk ${chunkId}: ${error.message}`);
        }
      });
  
    } catch (error) {
      console.error('Error starting recording:', error);
      this.sendError(`Failed to start recording: ${error.message}`);
      throw error;
    }
  }

  async stopRecording() {
    try {
      console.log(`[AudioSession] Stopping recording for session ${this.sessionId}`);
      
      if (this.recordingService.isRecording(this.sessionId)) {
        // Stop the recording service
        await this.recordingService.stopRecording(this.sessionId);
        console.log('[AudioSession] RecordingService stopped');
        
        // Update status
        this.status = 'stopped';
        
        // Send status update to client
        if (this.socket) {
          console.log('[AudioSession] Sending stopped status to client');
          this.socket.send(JSON.stringify({
            type: 'status',
            payload: {
              status: 'stopped',
              sessionId: this.sessionId
            },
            sessionId: this.sessionId,
            timestamp: Date.now()
          }));
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.sendError(`Failed to stop recording: ${error.message}`);
      throw error;
    }
  }

  async processChunk(chunkId, data) {
    try {
      console.log(`[AudioSession] Processing chunk ${chunkId} for session ${this.sessionId}`);
      
      // Create the chunk path first
      const chunkPath = join(AUDIO_DIR, this.sessionId, `chunk-${chunkId}.webm`);
      
      // Validate chunk not already processed
      const chunkKey = `${this.sessionId}-${chunkId}`;
      if (this._processedChunks.has(chunkKey)) {
        console.log(`[AudioSession] Chunk ${chunkId} already processed, skipping`);
        return null;
      }
  
      // Verify the file exists and has content
      try {
        const stats = await fs.stat(chunkPath);
        console.log(`[AudioSession] Chunk file exists with size: ${stats.size} bytes`);
        if (stats.size === 0) {
          throw new Error('Chunk file is empty');
        }
      } catch (err) {
        console.error(`[AudioSession] Failed to read chunk file:`, err);
        return null;
      }
  
      // Process chunk and get transcription
      const chunk = {
        path: chunkPath,
        size: data.length,
        timestamp: Date.now(),
      };
      
      console.log(`[AudioSession] Starting transcription for chunk ${chunkId}`);
      const transcription = await this.transcribeChunk(chunk, chunkId);
      
      if (transcription) {
        // Update transcription file
        const transcriptionPath = join(METADATA_DIR, `${this.sessionId}-transcription.json`);
        let transcriptionData;
        
        try {
          const existingData = await fs.readFile(transcriptionPath, 'utf-8');
          transcriptionData = JSON.parse(existingData);
        } catch {
          transcriptionData = {
            sessionId: this.sessionId,
            lastUpdated: Date.now(),
            transcriptions: []
          };
        }
  
        // Add new transcription
        transcriptionData.transcriptions.push(transcription);
        transcriptionData.lastUpdated = Date.now();
        
        // Save file and notify client
        await fs.writeFile(transcriptionPath, JSON.stringify(transcriptionData, null, 2));
        
        if (this.socket) {
          console.log(`[AudioSession] Sending transcription to client:`, transcription);
          this.socket.send(JSON.stringify({
            type: 'transcription',
            payload: { transcription },
            sessionId: this.sessionId,
            timestamp: Date.now()
          }));
        }
      }
  
      // Mark chunk as processed
      this._processedChunks.add(chunkKey);
      return chunk;
      
    } catch (error) {
      console.error(`[AudioSession] Error processing chunk ${chunkId}:`, error);
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
      
      // Wait for the file to be fully written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const transcription = await this.transcriptionService.transcribeFile(chunk.path, this.sessionId);
      
      // Add chunk metadata to transcription
      const enhancedTranscription = {
        ...transcription,
        chunkId,
        timestamp: chunk.timestamp || Date.now()
      };
  
      console.log(`Transcription completed for chunk ${chunkId}:`, enhancedTranscription);
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