import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { createWriteStream, mkdirSync } from 'fs';
import crypto from 'crypto';
import TranscriptionService from './src/lib/services/transcription.js';
import dotenv from 'dotenv';

dotenv.config();

const transcriptionService = new TranscriptionService(process.env.OPENAI_API_KEY);

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants and configurations
const AUDIO_DIR = join(__dirname, 'audio-chunks');
const RECORDINGS_DIR = join(__dirname, 'recordings');
const METADATA_DIR = join(__dirname, 'metadata');

console.log('=== Initializing Server ===');

// Ensure all required directories exist
try {
  for (const dir of [AUDIO_DIR, RECORDINGS_DIR, METADATA_DIR]) {
    mkdirSync(dir, { recursive: true });
    console.log(`Directory created/verified: ${dir}`);
  }
} catch (error) {
  console.error('Failed to create directories:', error);
  process.exit(1);
}

// Session tracking
const activeSessions = new Map();

class AudioSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.chunks = new Map();
    this.status = 'initializing';
    this.metadata = {
      totalDuration: 0,
      totalSize: 0,
      lastChunkId: -1,
      checksums: new Set(),
      transcription: null
    };
  }

  async addChunk(chunkId, data, metadata) {
    try {
      // Verify chunk order
      if (chunkId !== this.metadata.lastChunkId + 1) {
        throw new Error(`Invalid chunk order. Expected ${this.metadata.lastChunkId + 1}, got ${chunkId}`);
      }

      // Calculate and verify checksum
      const calculatedChecksum = await this.calculateChecksum(data);
      if (metadata.checksum && calculatedChecksum !== metadata.checksum) {
        throw new Error('Checksum verification failed');
      }

      // Prevent duplicate chunks
      if (this.metadata.checksums.has(calculatedChecksum)) {
        throw new Error('Duplicate chunk detected');
      }

      // Save chunk
      const chunkPath = join(AUDIO_DIR, this.sessionId, `chunk-${chunkId}.webm`);
      await fs.writeFile(chunkPath, data);

      // Update metadata
      this.chunks.set(chunkId, {
        path: chunkPath,
        timestamp: Date.now(),
        size: data.length,
        checksum: calculatedChecksum
      });

      this.metadata.lastChunkId = chunkId;
      this.metadata.checksums.add(calculatedChecksum);
      this.metadata.totalSize += data.length;
      this.metadata.totalDuration += 1000; // 1-second chunks

      // Save session metadata
      await this.saveMetadata();

      return true;
    } catch (error) {
      console.error(`Error processing chunk ${chunkId}:`, error);
      throw error;
    }
  }

  async calculateChecksum(data) {
    return crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');
  }

  async saveMetadata() {
    const metadataPath = join(METADATA_DIR, `${this.sessionId}.json`);
    const metadata = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      status: this.status,
      totalDuration: this.metadata.totalDuration,
      totalSize: this.metadata.totalSize,
      lastChunkId: this.metadata.lastChunkId,
      checksums: Array.from(this.metadata.checksums),
      transcription: this.metadata.transcription
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  }

  async transcribeRecording(outputPath) {
    try {
      console.log('Starting transcription for:', outputPath);
      const result = await transcriptionService.transcribeFile(outputPath, this.sessionId);
      
      // Save transcription to metadata
      const transcriptionPath = join(METADATA_DIR, `${this.sessionId}-transcription.json`);
      await fs.writeFile(transcriptionPath, JSON.stringify(result, null, 2));
      
      // Update session metadata
      this.metadata.transcription = result;
      await this.saveMetadata();

      return result;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw error;
    }
  }

  async finalize() {
    try {
      this.status = 'processing';
      await this.saveMetadata();

      // Verify all chunks are present
      const expectedChunks = Array.from({ length: this.metadata.lastChunkId + 1 }, (_, i) => i);
      const missingChunks = expectedChunks.filter(id => !this.chunks.has(id));

      if (missingChunks.length > 0) {
        throw new Error(`Missing chunks: ${missingChunks.join(', ')}`);
      }

      // Concatenate chunks
      const outputPath = join(RECORDINGS_DIR, `recording-${this.sessionId}.webm`);
      const output = createWriteStream(outputPath);

      for (let i = 0; i <= this.metadata.lastChunkId; i++) {
        const chunk = this.chunks.get(i);
        const chunkData = await fs.readFile(chunk.path);
        output.write(chunkData);
      }

      await new Promise((resolve, reject) => {
        output.on('finish', resolve);
        output.on('error', reject);
        output.end();
      });

      // Start transcription
      this.status = 'transcribing';
      await this.saveMetadata();
      
      const transcription = await this.transcribeRecording(outputPath);

      this.status = 'completed';
      await this.saveMetadata();

      return {
        path: outputPath,
        transcription
      };
    } catch (error) {
      this.status = 'failed';
      await this.saveMetadata();
      throw error;
    }
  }
}

const server = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

server.on('connection', (socket) => {
  console.log('=== New Client Connected ===');
  let currentSession = null;

  const sendError = (message) => {
    socket.send(JSON.stringify({
      type: 'error',
      payload: { message },
      timestamp: Date.now()
    }));
  };
  
  const sendStatus = (status) => {
    socket.send(JSON.stringify({
      ...status,
      timestamp: Date.now()
    }));
  };

  socket.on('message', async (data, isBinary) => {
    try {
      if (isBinary) {
        // Handle binary audio data
        if (!currentSession) {
          throw new Error('No active session');
        }

        const chunkId = currentSession.metadata.lastChunkId + 1;
        await currentSession.addChunk(chunkId, data, {});

        sendStatus({
          sessionId: currentSession.sessionId,
          chunkId,
          totalDuration: currentSession.metadata.totalDuration,
          totalSize: currentSession.metadata.totalSize
        });
      } else {
        // Handle control messages
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);

        switch (message.type) {
          case 'command':
            if (message.payload.action === 'start') {
              if (currentSession) {
                throw new Error('Session already in progress');
              }
              const sessionId = message.sessionId || `session-${Date.now()}`;
              console.log('Starting new session:', sessionId);
              currentSession = new AudioSession(sessionId);
              activeSessions.set(sessionId, currentSession);
              
              // Create session directory
              await fs.mkdir(join(AUDIO_DIR, sessionId), { recursive: true });
              sendStatus({ 
                sessionId, 
                status: 'initialized',
                type: 'status',
                timestamp: Date.now()
              });
            } else if (message.payload.action === 'stop') {
              if (!currentSession) {
                throw new Error('No active session to stop');
              }
              
              console.log('Stopping session:', currentSession.sessionId);
              
              const result = await currentSession.finalize();
              console.log('Finalize result:', result);
              
              sendStatus({
                type: 'recording_complete',
                payload: {
                  sessionId: currentSession.sessionId,
                  path: result.path,
                  duration: currentSession.metadata.totalDuration,
                  size: currentSession.metadata.totalSize,
                  transcription: result.transcription
                },
                sessionId: currentSession.sessionId,
                timestamp: Date.now()
              });
              
              currentSession = null;
            }
        
          case 'metadata':
            if (!currentSession) {
              throw new Error('No active session');
            }
            // Metadata handling is done in addChunk
            break;
        
          case 'chunk':
            if (!currentSession) {
              throw new Error('No active session');
            }
            console.log('Received chunk metadata:', message.payload);
            break;
        
          default:
            console.warn('Unknown message type:', message.type);
            break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      sendError(error.message);
    }
  });

  socket.on('close', async () => {
    if (currentSession) {
      try {
        await currentSession.finalize();
      } catch (error) {
        console.error('Error finalizing session:', error);
      }
      currentSession = null;
    }
    console.log('Client disconnected');
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
    sendError('Internal server error');
  });
});

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  activeSessions.forEach((session, sessionId) => {
    if (now - session.startTime > maxAge) {
      activeSessions.delete(sessionId);
    }
  });
}, 60 * 60 * 1000); // Check every hour

// Log active connections every 30 seconds
setInterval(() => {
  console.log(`Active connections: ${server.clients.size}`);
  console.log(`Active sessions: ${activeSessions.size}`);
}, 30000);