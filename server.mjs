import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs'; // Ensure this is explicitly imported
import fsPromises from 'fs/promises'; // For promise-based methods like writeFile
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
    await fs.mkdir(dir, { recursive: true }); // Promise-based mkdir
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
      transcription: null,
    };
    this.transcriptionService = new TranscriptionService();
    this.incrementalBuffer = []; // Buffer to hold data for incremental transcription
  }

  async addChunk(chunkId, data, metadata) {
    try {
      // Verify chunk order
      if (chunkId !== this.metadata.lastChunkId + 1) {
        console.warn(
          `Chunk order mismatch. Expected ${this.metadata.lastChunkId + 1}, got ${chunkId}.`
        );
        // Allow out-of-order chunks but log a warning
      }
  
      // Calculate and verify checksum
      const calculatedChecksum = await this.calculateChecksum(data);
      if (metadata.checksum && calculatedChecksum !== metadata.checksum) {
        throw new Error('Checksum verification failed');
      }
  
      // Prevent duplicate chunks
      if (this.metadata.checksums.has(calculatedChecksum)) {
        console.warn(`Duplicate chunk detected. Skipping chunkId ${chunkId}.`);
        return false; // Skip processing this chunk
      }
  
      // Save chunk to disk
      const chunkPath = join(AUDIO_DIR, this.sessionId, `chunk-${chunkId}.webm`);
      await fs.writeFile(chunkPath, data);
  
      // Update metadata
      this.chunks.set(chunkId, {
        path: chunkPath,
        timestamp: Date.now(),
        size: data.length,
        checksum: calculatedChecksum,
      });
  
      this.metadata.lastChunkId = Math.max(this.metadata.lastChunkId, chunkId); // Update to latest chunkId
      this.metadata.checksums.add(calculatedChecksum);
      this.metadata.totalSize += data.length;
      this.metadata.totalDuration += 1000; // Assume 1-second chunks for simplicity
  
      // **Add chunk data to the incremental buffer**
      this.incrementalBuffer.push(data); // Buffering the chunk data
      console.log('Chunk data added to incremental buffer. Buffer size:', this.incrementalBuffer.length);
  
      // Perform incremental transcription
      const incrementalPath = join(
        AUDIO_DIR,
        this.sessionId,
        `incremental-${Date.now()}.webm`
      );
  
      // Combine chunks into a temporary file for transcription
      const incrementalData = Buffer.concat(
        await Promise.all([...this.chunks.values()].map(async (chunk) => await fs.readFile(chunk.path)))
      );
      await fs.writeFile(incrementalPath, incrementalData);
  
      try {
        // Transcribe the combined file
        await this.performIncrementalTranscription(incrementalPath);
      } catch (error) {
        console.error(
          `Incremental transcription failed for chunkId ${chunkId}:`,
          error.message
        );
      }
  
      // Save session metadata
      await this.saveMetadata();
  
      return true;
    } catch (error) {
      console.error(`Error processing chunk ${chunkId}:`, error.message);
      throw error;
    }
  }
  
  

  async performIncrementalTranscription() {
    try {
      if (!this.incrementalBuffer.length) {
        console.log('No data in incremental buffer. Skipping transcription.');
        return;
      }
      console.log('Performing transcription on buffer size:', this.incrementalBuffer.length);

  
      // Concatenate buffered data for incremental transcription
      const tempFilePath = join(AUDIO_DIR, this.sessionId, `incremental-${Date.now()}.webm`);
      const buffer = Buffer.concat(this.incrementalBuffer);
  
      // Save the concatenated buffer to a temporary file
      await fs.writeFile(tempFilePath, buffer);
      console.log(`Incremental transcription file created at: ${tempFilePath}`);
  
      // Verify the file format before sending for transcription
      const supportedFormats = ['flac', 'm4a', 'mp3', 'mp4', 'mpeg', 'mpga', 'oga', 'ogg', 'wav', 'webm'];
      const fileExtension = tempFilePath.split('.').pop();
      if (!supportedFormats.includes(fileExtension)) {
        throw new Error(`Invalid file format for transcription: .${fileExtension}`);
      }
  
      // Call transcription service
      console.log('Starting incremental transcription...');
      const transcription = await this.transcriptionService.transcribeFile(tempFilePath, this.sessionId);
  
      // Send incremental transcription to the client
      if (transcription?.text) {
        console.log('Incremental transcription successful:', transcription.text);
        this.sendTranscriptionUpdate(transcription);
      } else {
        console.warn('Received empty transcription result.');
      }
  
      // Clear the incremental buffer
      this.incrementalBuffer = [];
    } catch (error) {
      console.error('Error during incremental transcription:', error);
  
      // Optional: Notify the client about the error
      this.sendError(`Incremental transcription failed: ${error.message}`);
    }
  }
  
  async finalize() {
    try {
        // Concatenate all chunks into a single file
        const outputPath = join(RECORDINGS_DIR, `recording-${this.sessionId}.webm`);
        const outputStream = fs.createWriteStream(outputPath);

        for (let i = 0; i <= this.metadata.lastChunkId; i++) {
            const chunk = this.chunks.get(i);
            const chunkData = await fs.readFile(chunk.path);
            outputStream.write(chunkData);
        }

        outputStream.end();
        await new Promise((resolve) => outputStream.on('finish', resolve));

        // Update metadata
        this.metadata.status = 'finalized';
        await this.saveMetadata();

        // Perform final transcription
        const transcription = await this.transcribeRecording(outputPath);

        return { path: outputPath, transcription };
    } catch (error) {
        console.error('Error finalizing session:', error);
        throw error;
    }
}

sendError(message) {
  if (this.socket) {
      this.socket.send(JSON.stringify({
          type: 'error',
          payload: { message },
          sessionId: this.sessionId,
          timestamp: Date.now(),
      }));
  } else {
      console.warn(`No WebSocket connection to send error: ${message}`);
  }
}

  sendTranscriptionUpdate(transcription) {
    try {
        if (this.socket && this.socket.readyState === this.socket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'transcription',
                payload: { transcription },
                sessionId: this.sessionId,
                timestamp: Date.now(),
            }));
            console.log(`Transcription update sent for session ${this.sessionId}:`, transcription);
        } else {
            console.warn(`Socket not open. Unable to send transcription update for session ${this.sessionId}.`);
        }
    } catch (error) {
        console.error(`Error sending transcription update for session ${this.sessionId}:`, error);
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
      transcription: this.metadata.transcription,
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
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
            await currentSession.addChunk(chunkId, data, {});

            // Notify client of successful chunk processing
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
            // Handle control messages or metadata
            const message = JSON.parse(data.toString());
            console.log('Received control message:', message);

            switch (message.type) {
                case 'command':
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

                        // Ensure any remaining buffer is processed
                        await currentSession.performIncrementalTranscription();

                        const result = await currentSession.finalize();

                        socket.send(JSON.stringify({
                            type: 'recording_complete',
                            payload: {
                                path: result.path,
                                duration: currentSession.metadata.totalDuration,
                                size: currentSession.metadata.totalSize,
                                transcription: result.transcription,
                            },
                            sessionId: currentSession.sessionId,
                            timestamp: Date.now(),
                        }));
                    }
                    break;

                case 'chunk':
                    if (!currentSession) {
                        throw new Error('No active session to process chunk');
                    }

                    console.log('Processing chunk metadata:', message.payload);
                    const chunkId = message.payload.chunkId || currentSession.metadata.lastChunkId + 1;
                    const chunkMetadata = {
                        checksum: message.payload.checksum,
                        timestamp: message.payload.timestamp,
                        size: message.payload.size,
                    };

                    await currentSession.addChunk(chunkId, data, chunkMetadata);

                    // Notify client that the chunk was processed
                    socket.send(JSON.stringify({
                        type: 'chunk_processed',
                        payload: {
                            chunkId,
                            totalDuration: currentSession.metadata.totalDuration,
                            totalSize: currentSession.metadata.totalSize,
                        },
                        sessionId: currentSession.sessionId,
                        timestamp: Date.now(),
                    }));
                    break;

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
    socket.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Internal server error' },
      timestamp: Date.now()
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