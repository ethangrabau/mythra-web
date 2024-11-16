import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';  // Add this import
import fs from 'fs/promises';
import express from 'express';  // Keep only this one
import cors from 'cors';  // Add this if not already present
import { fileWatcher } from './file-watcher.js';
import { normalizeSessionId } from './src/lib/utils/session.js';
import { AudioSession } from './src/lib/services/audioSession.js';  // Add this import
import TranscriptionService from './src/lib/services/transcription.js';  // Add this




// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants and configurations
const AUDIO_DIR = join(__dirname, 'audio-chunks');
const RECORDINGS_DIR = join(__dirname, 'recordings');
const METADATA_DIR = join(__dirname, 'metadata');
const IMAGES_DIR = join(__dirname, 'generated_images');

console.log('=== Initializing Server ===');

// Ensure all required directories exist
try {
  for (const dir of [AUDIO_DIR, RECORDINGS_DIR, METADATA_DIR, IMAGES_DIR]) {
    mkdirSync(dir, { recursive: true });
    console.log(`Directory created/verified: ${dir}`);
  }
} catch (error) {
  console.error('Failed to create directories:', error);
  process.exit(1);
}

// Session tracking
const activeSessions = new Map();

const server = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

server.on('connection', (socket) => {
  console.log('=== New Client Connected ===');
  let currentSession = null;
  const transcriptionService = new TranscriptionService(); // Create once per connection

  socket.on('message', async (data, isBinary) => {
    try {
      if (isBinary) {
        // Handle binary data (audio chunk)
        const chunkId = currentSession.metadata.lastChunkId + 1;
  
        // Add chunk and handle empty or invalid chunks gracefully
        const chunk = await currentSession.addChunk(chunkId, data);
  
        // Skip invalid or empty chunks
        if (!chunk) {
          console.warn(`Skipped invalid or empty chunk with ID: ${chunkId}`);
          return; // Don't proceed with transcription for this chunk
        }
  
        // Transcribe the valid chunk
        const transcription = await currentSession.transcribeChunk(chunk, chunkId);
  
        // Send incremental transcription to the client
        socket.send(
          JSON.stringify({
            type: 'transcription',
            payload: {
              chunkId,
              chunk, // Metadata for the chunk
              transcription, // Transcription result
            },
            sessionId: currentSession.sessionId,
            timestamp: Date.now(),
          })
        );
      } else {
        // Handle control messages
        const message = JSON.parse(data.toString());
        console.log('Received control message:', message);
  
        switch (message.type) {
          case 'command':
            if (message.payload.action === 'start') {
              if (currentSession) {
                throw new Error('Session already in progress');
              }
  
              // Start a new session
              const sessionId = message.payload.sessionId || `session-${Date.now()}`;
              console.log('Starting new session:', sessionId);
  
              // Create the session directory
              const sessionDir = join(AUDIO_DIR, sessionId);
              await fs.mkdir(sessionDir, { recursive: true });
  
              // Initialize new AudioSession
              currentSession = new AudioSession(sessionId, transcriptionService);
              currentSession.setSocket(socket); // Attach the WebSocket to the session
              activeSessions.set(sessionId, currentSession);
  
              // Notify the client that the session has started
              socket.send(
                JSON.stringify({
                  type: 'status',
                  payload: { status: 'initialized', sessionId },
                  sessionId,
                  timestamp: Date.now(),
                })
              );
            } else if (message.payload.action === 'stop') {
              // Stop the current session
              if (!currentSession) {
                throw new Error('No active session to stop');
              }
  
              console.log('Stopping recording for session:', currentSession.sessionId);
  
              // Finalize the session
              const result = await currentSession.finalize();
  
              // Notify the client that recording is complete
              socket.send(
                JSON.stringify({
                  type: 'recording_complete',
                  payload: {
                    path: result.sessionId,
                    duration: currentSession.metadata.totalDuration,
                    size: currentSession.metadata.totalSize,
                    transcriptions: result.transcriptions,
                  },
                  sessionId: currentSession.sessionId,
                  timestamp: Date.now(),
                })
              );
            } else if (message.payload.action === 'end') {
              // End the current session
              if (!currentSession) {
                throw new Error('No active session to end');
              }
  
              console.log('Ending session:', currentSession.sessionId);
  
              // Finalize and clean up the session
              await currentSession.finalize();
              activeSessions.delete(currentSession.sessionId);
              currentSession = null;
  
              // Notify the client that the session has ended
              socket.send(
                JSON.stringify({
                  type: 'session_ended',
                  sessionId: message.payload.sessionId,
                  timestamp: Date.now(),
                })
              );
            }
            break;
  
          default:
            console.warn('Unknown message type:', message.type);
            break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
  
      // Send error to client
      if (currentSession) {
        currentSession.sendError(error.message);
      } else {
        socket.send(
          JSON.stringify({
            type: 'error',
            payload: { message: error.message },
            timestamp: Date.now(),
          })
        );
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

const app = express();

// Move middleware setup before routes
app.use(cors());
app.use('/api/images', express.static(IMAGES_DIR));

app.get('/api/images/latest/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Image request:', {
      requestedId: sessionId,
      normalizedId: normalizeSessionId(sessionId)
    });
    
    const files = await fs.readdir(IMAGES_DIR);
    const normalizedRequestId = normalizeSessionId(sessionId);
    
    const sessionImages = files.filter(file => {
      const normalizedFileId = normalizeSessionId(file.split('-')[0] + '-' + file.split('-')[1]);
      return normalizedFileId === normalizedRequestId;
    });

    console.log('Image matching:', {
      normalizedRequestId,
      foundImages: sessionImages
    });

    if (sessionImages.length > 0) {
      // Sort by timestamp to get the latest
      const latestImage = sessionImages.sort().reverse()[0];
      res.json({ imagePath: `/api/images/${latestImage}` });
    } else {
      res.status(404).json({ error: 'No images found for this session' });
    }
  } catch (error) {
    console.error('Error in image endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Express server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Express API running on http://localhost:${PORT}`);
  // Start the file watcher after server is ready
  fileWatcher.start();
});