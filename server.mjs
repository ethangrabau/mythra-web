import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { createWriteStream, mkdirSync } from 'fs';
import crypto from 'crypto';
import TranscriptionService from './src/lib/services/transcription.js';

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
  constructor(sessionId, socket = null) {
    this.sessionId = sessionId;
    this.socket = socket;
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
    this.transcriptionService = new TranscriptionService();
    // Initialize transcription queue
    this.transcriptionQueue = Promise.resolve();
  }

  async addChunk(chunkId, data) {
    try {
      console.log(`Chunk received: ID=${chunkId}, Size=${data.length}, Session=${this.sessionId}`);
  
      // Save the chunk to disk
      const chunkPath = join(AUDIO_DIR, this.sessionId, `chunk-${chunkId}.webm`);
      await fs.writeFile(chunkPath, data);
  
      console.log(`Chunk saved. Adding chunk ${chunkId} to batch queue.`);
  
      // Add the chunk to the batch queue
      this.chunks.set(chunkId, { path: chunkPath, timestamp: Date.now(), size: data.length });
  
      // Batch chunks for transcription
      if (chunkId % 5 === 0 || chunkId === this.metadata.lastChunkId) { // Every 5 chunks or last chunk
        console.log(`Batching chunks for transcription: ${chunkId - 4} to ${chunkId}`);
  
        // Concatenate chunks
        const batchPath = join(AUDIO_DIR, this.sessionId, `batch-${chunkId}.webm`);
        const output = createWriteStream(batchPath);
  
        for (let i = chunkId - 4; i <= chunkId; i++) {
          if (this.chunks.has(i)) {
            const chunkData = await fs.readFile(this.chunks.get(i).path);
            output.write(chunkData);
          }
        }
  
        await new Promise((resolve, reject) => {
          output.on('finish', resolve);
          output.on('error', reject);
          output.end();
        });
  
        console.log(`Batch ${chunkId} saved at ${batchPath}. Adding to transcription queue.`);
  
        // Add the batch file to the transcription queue
        this.transcriptionQueue = this.transcriptionQueue
          .then(async () => {
            const transcriptionResult = await this.transcriptionService.transcribeChunk(batchPath, this.sessionId);
  
            if (transcriptionResult) {
              console.log(`Transcription completed for batch ${chunkId}:`, transcriptionResult);
  
              // Send transcription to the client
              if (this.socket) {
                this.socket.send(
                  JSON.stringify({
                    type: 'transcription',
                    payload: {
                      transcription: transcriptionResult,
                      batchId: chunkId,
                    },
                    sessionId: this.sessionId,
                    timestamp: Date.now(),
                  })
                );
              }
            }
          })
          .catch((error) => {
            console.error(`Error transcribing batch ${chunkId}:`, error);
          });
      }
  
      // Update metadata
      this.metadata.lastChunkId = chunkId;
      this.metadata.totalSize += data.length;
      this.metadata.totalDuration += 1000; // Assume 1-second chunks
      await this.saveMetadata();
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
      
      // Verify file exists
      try {
        await fs.access(outputPath);
      } catch (error) {
        throw new Error(`Output file not found at: ${outputPath} ${error.message}`);
      }

      // Log file stats for debugging
      const stats = await fs.stat(outputPath);
      console.log('File stats:', {
        size: stats.size,
        path: outputPath,
        exists: true
      });

      // Send status update to client
      this.sendStatus('Transcribing audio...');

      const result = await this.transcriptionService.transcribeFile(outputPath, this.sessionId);
      
      // Send success status to client
      this.sendStatus('Transcription completed');
      
      // Save transcription result
      const transcriptionPath = join(METADATA_DIR, `${this.sessionId}-transcription.json`);
      await fs.writeFile(transcriptionPath, JSON.stringify(result, null, 2));
      
      // Update session metadata
      this.metadata.transcription = result;
      await this.saveMetadata();

      return result;
    } catch (error) {
      console.error('Transcription failed:', error);
      this.status = 'failed';
      await this.saveMetadata();
      
      // Send error to client
      this.sendError(`Transcription failed: ${error.message}`);
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
  
      // Concatenate chunks into a single file for archiving purposes
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
  
      console.log(`Session ${this.sessionId} finalized. File saved at ${outputPath}`);
  
      // Notify client that the session is finalized
      this.socket.send(JSON.stringify({
        type: 'recording_complete',
        payload: {
          path: outputPath,
          duration: this.metadata.totalDuration,
          size: this.metadata.totalSize,
          transcription: this.metadata.transcription, // Use the transcription gathered from chunks
        },
        sessionId: this.sessionId,
        timestamp: Date.now(),
      }));
  
      this.status = 'completed';
      await this.saveMetadata();
  
      return {
        path: outputPath,
        transcription: this.metadata.transcription, // Final transcription
      };
    } catch (error) {
      console.error('Error in finalize:', error);
      this.status = 'failed';
      await this.saveMetadata();
      throw error;
    }
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
}

const server = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

server.on('connection', (socket) => {
  console.log('=== New Client Connected ===');
  let currentSession = null;

  socket.on('message', async (data, isBinary) => {
    try {
      if (isBinary) {
        // Handle binary audio data
        if (!currentSession) {
          throw new Error('No active session');
        }

        console.log('Received binary chunk of size:', data.length);
        const chunkId = currentSession.metadata.lastChunkId + 1;

        // Process the chunk and handle transcription
        await currentSession.addChunk(chunkId, data);

        // Notify client of chunk processing
        socket.send(JSON.stringify({
          type: 'status',
          payload: {
            chunkId,
            totalDuration: currentSession.metadata.totalDuration,
            totalSize: currentSession.metadata.totalSize,
          },
          sessionId: currentSession.sessionId,
          timestamp: Date.now(),
        }));
      } else {
        // Handle control messages
        const message = JSON.parse(data.toString());
        console.log('Received control message:', message);

        switch (message.type) {
          case 'command': {
            if (message.payload.action === 'start') {
              if (currentSession) {
                throw new Error('Session already in progress');
              }

              const sessionId = `session-${Date.now()}`;
              console.log('Starting new session:', sessionId);

              const sessionDir = join(AUDIO_DIR, sessionId);
              await fs.mkdir(sessionDir, { recursive: true });

              currentSession = new AudioSession(sessionId, socket);
              activeSessions.set(sessionId, currentSession);

              socket.send(JSON.stringify({
                type: 'status',
                payload: { status: 'initialized' },
                sessionId,
                timestamp: Date.now(),
              }));
            } else if (message.payload.action === 'stop') {
              if (!currentSession) {
                throw new Error('No active session to stop');
              }

              console.log('Stopping recording for session:', currentSession.sessionId);
              await currentSession.finalize();

              socket.send(JSON.stringify({
                type: 'recording_complete',
                payload: {
                  path: `recording-${currentSession.sessionId}.webm`,
                  duration: currentSession.metadata.totalDuration,
                  size: currentSession.metadata.totalSize,
                },
                sessionId: currentSession.sessionId,
                timestamp: Date.now(),
              }));
            }
            break;
          }

          case 'transcription': {
            console.log('Received transcription:', message.payload.transcription);

            // Forward transcription to client
            socket.send(JSON.stringify({
              type: 'transcription',
              payload: message.payload.transcription,
              sessionId: message.sessionId,
              timestamp: Date.now(),
            }));
            break;
          }

          default:
            console.warn('Unknown message type:', message.type);
            break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      if (currentSession) {
        currentSession.sendError(error.message);
      } else {
        socket.send(JSON.stringify({
          type: 'error',
          payload: { message: error.message },
          timestamp: Date.now(),
        }));
      }
    }
  });

  socket.on('close', async () => {
    try {
      if (currentSession) {
        await currentSession.finalize();
        currentSession = null;
      }
      console.log('Client disconnected');
    } catch (error) {
      console.error('Error finalizing session on client disconnect:', error);
    }
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
    socket.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Internal server error' },
      timestamp: Date.now(),
    }));
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

import express from 'express';
const app = express();

app.get('/api/transcription/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const transcriptionPath = join(METADATA_DIR, `${sessionId}-transcription.json`);
    try {
        const data = await fs.readFile(transcriptionPath, 'utf-8');
        res.json(JSON.parse(data)); // Sends the transcription as JSON.
    } catch (error) {
        console.error(`Error fetching transcription for session ${sessionId}:`, error);
        res.status(404).send({ error: 'Transcription not found' });
    }
});

// Start Express server
const PORT = 3001; // Use a port not conflicting with WebSocket.
app.listen(PORT, () => {
    console.log(`Express API running on http://localhost:${PORT}`);
});