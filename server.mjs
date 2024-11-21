// server.mjs
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';
import fs from 'fs/promises';
import express from 'express';
import cors from 'cors';
import { fileWatcher } from './file-watcher.js';
import { normalizeSessionId } from './src/lib/utils/session.js';
import { AudioSession } from './src/lib/services/audioSession.js';
import TranscriptionService from './src/lib/services/transcription.js';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Constants and configurations
const AUDIO_DIR = join(__dirname, 'audio-chunks');
const RECORDINGS_DIR = join(__dirname, 'recordings');
const METADATA_DIR = join(__dirname, 'metadata');
const IMAGES_DIR = join(__dirname, 'generated_images');

const cleanupSession = async (session) => {
  if (!session) return;
  
  try {
    // Stop recording if active
    if (session.recordingService.isRecording(session.sessionId)) {
      await session.stopRecording();
    }
    
    // Finalize session
    await session.finalize();
    
    // Clear from active sessions
    activeSessions.delete(session.sessionId);
  } catch (error) {
    console.error('Error cleaning up session:', error);
  }
};

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
  const transcriptionService = new TranscriptionService();

  socket.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Server: Received message:', message);
  
      switch (message.type) {
        case 'command':
          if (message.payload.action === 'start') {
            console.log('Server: Processing start command...');
            // Clean up existing session if there is one
            if (currentSession) {
              console.log('Server: Cleaning up existing session:', currentSession.sessionId);
              await cleanupSession(currentSession);
              currentSession = null;
            }
  
            const sessionId = message.payload.sessionId || `session-${Date.now()}`;
            console.log('Server: Starting new session:', sessionId);
  
            // Create session directory
            const sessionDir = join(AUDIO_DIR, sessionId);
            await fs.mkdir(sessionDir, { recursive: true });
  
            // Initialize new session
            currentSession = new AudioSession(sessionId, transcriptionService);
            currentSession.setSocket(socket);
            activeSessions.set(sessionId, currentSession);
  
            try {
              await currentSession.startRecording();
              
              socket.send(JSON.stringify({
                type: 'status',
                payload: { status: 'recording', sessionId },
                sessionId,
                timestamp: Date.now(),
              }));
            } catch (error) {
              console.error('Server: Failed to start recording:', error);
              await cleanupSession(currentSession);
              currentSession = null;
              throw error;
            }
          }
          else if (message.payload.action === 'stop') {
            console.log('Server: Processing stop command with full message:', message);
            if (!currentSession) {
              console.error('Server: No active session found');
              return;
            }
          
            try {
              await currentSession.stopRecording();
              console.log('Server: Recording stopped, sending status update');
              
              // Ensure we update the session state
              currentSession.status = 'stopped';
              
              socket.send(JSON.stringify({
                type: 'status',
                payload: { 
                  status: 'stopped', 
                  sessionId: currentSession.sessionId 
                },
                sessionId: currentSession.sessionId,
                timestamp: Date.now()
              }));
            } catch (error) {
              console.error('Server: Error during stop:', error);
            }
          }
          else if (message.payload.action === 'end') {
            console.log('Server: Processing end command...');
            if (!currentSession) {
              console.error('Server: No active session to end');
              throw new Error('No active session to end');
            }
  
            await cleanupSession(currentSession);
            currentSession = null;
  
            socket.send(JSON.stringify({
              type: 'session_ended',
              sessionId: message.payload.sessionId,
              timestamp: Date.now(),
            }));
          }
          break;

        default:
          console.warn('Unknown message type:', message.type);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(JSON.stringify({
        type: 'error',
        payload: { message: error.message },
        timestamp: Date.now(),
      }));
    }
  });

  // Update the close handler
socket.on('close', async () => {
  if (currentSession) {
    await cleanupSession(currentSession);
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