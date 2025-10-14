// server.mjs
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import fs from 'fs/promises';
import express from 'express';
import cors from 'cors';
import { fileWatcher } from './file-watcher.js';
import { normalizeSessionId } from './src/lib/utils/session.js';
import { AudioSession } from './src/lib/services/audioSession.js';
import TranscriptionService from './src/lib/services/transcription.js';
import CampaignManager from './src/lib/services/campaignManager.js';

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
    console.log('Server: Starting cleanup of session:', session.sessionId);
    // Stop recording if active
    if (session.recordingService.isRecording(session.sessionId)) {
      await session.stopRecording();
    }
    
    // Finalize session
    await session.finalize();
    
    // Clear from active sessions
    const removed = activeSessions.delete(session.sessionId);
    console.log('Server: Session removed from active sessions:', removed);
    console.log('Server: Remaining active sessions:', activeSessions.size);
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
        case 'text_input':
          console.log('Server: Processing text input:', message.payload.text);
          // Process text input as a transcription
          
          // Try to recover session if currentSession is null
          if (!currentSession && message.sessionId) {
            currentSession = activeSessions.get(message.sessionId);
            console.log('Server: Recovered session from activeSessions:', currentSession?.sessionId);
          }
          
          if (currentSession) {
            // Create a mock transcription object
            const textTranscription = {
              text: message.payload.text,
              timestamp: Date.now(),
              sessionId: currentSession.sessionId,
              isManualInput: true
            };
            
            // Send it back as a transcription
            socket.send(JSON.stringify({
              type: 'transcription',
              payload: { transcription: textTranscription },
              sessionId: currentSession.sessionId,
              timestamp: Date.now()
            }));
            
            // Save to transcription file for processing
            const transcriptionPath = join(METADATA_DIR, `${currentSession.sessionId}-transcription.json`);
            let transcriptionData;
            
            try {
              const existingData = await fs.readFile(transcriptionPath, 'utf-8');
              transcriptionData = JSON.parse(existingData);
            } catch {
              transcriptionData = {
                sessionId: currentSession.sessionId,
                lastUpdated: Date.now(),
                transcriptions: []
              };
            }
            
            transcriptionData.transcriptions.push(textTranscription);
            transcriptionData.lastUpdated = Date.now();
            await fs.writeFile(transcriptionPath, JSON.stringify(transcriptionData, null, 2));
            
            console.log('Server: Text input processed and saved as transcription');
          } else {
            console.log('Server: No active session for text input. Please start a session first.');
          }
          break;
        case 'session_reset':
          console.log('Server: Processing session reset command...');
          fileWatcher.resetMemory();
          socket.send(JSON.stringify({
            type: 'status',
            payload: { status: 'reset_complete' },
            sessionId: message.sessionId || '',
            timestamp: Date.now()
          }));
          break;
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
    const campaignId = message.payload.campaignId || null;
    console.log('Server: Starting new session:', sessionId, 'for campaign:', campaignId);

    // Set active campaign in file watcher if provided
    if (campaignId) {
      fileWatcher.setActiveCampaign(campaignId);
    }

    // Create session directory
    const sessionDir = join(AUDIO_DIR, sessionId);
    await fs.mkdir(sessionDir, { recursive: true });

    // Initialize new session and add to active sessions
    currentSession = new AudioSession(sessionId, transcriptionService);
    currentSession.campaignId = campaignId; // Store campaign ID with session
    currentSession.setSocket(socket);
    activeSessions.set(sessionId, currentSession);
    console.log('Server: Session added to active sessions. Current count:', activeSessions.size);
    console.log('Server: Active sessions:', Array.from(activeSessions.keys()));

    // Send initial status
    socket.send(
      JSON.stringify({
        type: 'status',
        payload: { status: 'ready', sessionId, campaignId },
        sessionId,
        campaignId,
        timestamp: Date.now(),
      })
    );
  } else if (message.payload.action === 'startRecording') {
    console.log('Server: Processing startRecording command...');
    if (!currentSession) {
      console.error('Server: No active session found');
      // Try to recover by finding session in activeSessions map
      const sessionId = message.payload.sessionId;
      currentSession = activeSessions.get(sessionId);
      if (!currentSession) {
        console.error('Server: Could not recover session');
        return;
      }
      console.log('Server: Recovered session:', sessionId);
    }

    try {
      await currentSession.startRecording();
      currentSession.status = 'recording';
      console.log(`Server: Recording started for session ${currentSession.sessionId}`);

      socket.send(
        JSON.stringify({
          type: 'status',
          payload: { status: 'recording', sessionId: currentSession.sessionId },
          sessionId: currentSession.sessionId,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Server: Error starting recording:', error);
    }
  } else if (message.payload.action === 'stop') {
    console.log('Server: Processing stop command with full message:', message);
    if (!currentSession) {
      console.error('Server: No active session found');
      // Try to recover session
      const sessionId = message.payload.sessionId;
      currentSession = activeSessions.get(sessionId);
      if (!currentSession) {
        console.error('Server: Could not recover session');
        return;
      }
      console.log('Server: Recovered session:', sessionId);
    }

    try {
      await currentSession.stopRecording();
      console.log('Server: Recording stopped, sending status update');

      // Ensure we update the session state
      currentSession.status = 'stopped';

      socket.send(
        JSON.stringify({
          type: 'status',
          payload: {
            status: 'stopped',
            sessionId: currentSession.sessionId,
          },
          sessionId: currentSession.sessionId,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Server: Error during stop:', error);
    }
  } else if (message.payload.action === 'end') {
    console.log('Server: Processing end command...');
    if (!currentSession) {
      console.error('Server: No active session to end');
      throw new Error('No active session to end');
    }

    await cleanupSession(currentSession);
    currentSession = null;

    socket.send(
      JSON.stringify({
        type: 'session_ended',
        sessionId: message.payload.sessionId,
        timestamp: Date.now(),
      })
    );
  }
  break;
        
        case 'newImage':
          // Forward the newImage message to all connected clients
          console.log('Server: Forwarding newImage message');
          server.clients.forEach((client) => {
            if (client.readyState === 1) { // 1 is OPEN state in ws library
              client.send(JSON.stringify({
                type: 'newImage',
                payload: message.payload,
                timestamp: Date.now()
              }));
            }
          });
          break;
          
        default:
          console.warn('Unknown message type:', message.type);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      socket.send(
        JSON.stringify({
          type: 'error',
          payload: { message: error.message },
          timestamp: Date.now(),
        })
      );
    }
  });
  

  // Update the close handler
  socket.on('close', async () => {
    console.log('Client disconnected, but keeping session active');
    // Remove cleanup code to keep session alive
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
const campaignManager = new CampaignManager();

// Move middleware setup before routes
app.use(cors());
app.use(express.json());

// Campaign API endpoints
app.get('/api/campaigns', (req, res) => {
  try {
    const campaigns = campaignManager.listCampaigns();
    res.json({ campaigns });
  } catch (error) {
    console.error('Error listing campaigns:', error);
    res.status(500).json({ error: 'Failed to list campaigns' });
  }
});

app.post('/api/campaigns', (req, res) => {
  try {
    const { name, description } = req.body;
    const result = campaignManager.createCampaign(name, description);
    
    if (result.error) {
      res.status(400).json(result);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

app.delete('/api/campaigns/:id', (req, res) => {
  try {
    const success = campaignManager.deleteCampaign(req.params.id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Campaign not found' });
    }
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

app.get('/api/campaigns/:id/memory', (req, res) => {
  try {
    const memory = campaignManager.loadCampaignMemory(req.params.id);
    res.json({ memory });
  } catch (error) {
    console.error('Error loading campaign memory:', error);
    res.status(500).json({ error: 'Failed to load campaign memory' });
  }
});

// Add route to list all images (before static middleware)
app.get('/api/images', async (req, res) => {
  try {
    const { campaignId } = req.query;
    const dir = campaignId 
      ? join(IMAGES_DIR, campaignId)
      : IMAGES_DIR;
      
    const files = await fs.readdir(dir).catch(() => []);
    const imageFiles = files.filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
    );
    const basePath = campaignId ? `/api/images/${campaignId}` : '/api/images';
    res.json({ images: imageFiles.map(file => `${basePath}/${file}`) });
  } catch (error) {
    console.error('Error listing images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all images for a campaign/session
app.get('/api/campaign-images/:campaignId', async (req, res) => {
  try {
    // Use the campaign ID as-is for the directory path
    const campaignId = req.params.campaignId;
    const campaignDir = join(IMAGES_DIR, campaignId);
    
    if (!existsSync(campaignDir)) {
      return res.json({ images: [] });
    }
    
    const files = await fs.readdir(campaignDir);
    const images = files
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        // Extract timestamp from the filename (last number before .png)
        const aMatch = a.match(/(\d+)\.png$/);
        const bMatch = b.match(/(\d+)\.png$/);
        const aTime = aMatch ? parseInt(aMatch[1]) : 0;
        const bTime = bMatch ? parseInt(bMatch[1]) : 0;
        return aTime - bTime; // Oldest first (chronological order)
      })
      .map(file => `/api/images/${campaignId}/${file}`);
    
    res.json({ images });
  } catch (error) {
    console.error('Error getting campaign images:', error);
    res.status(500).json({ error: 'Failed to get images' });
  }
});

app.get('/api/images/latest/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Image request for session:', sessionId);
    
    const files = await fs.readdir(IMAGES_DIR);
    const normalizedRequestId = normalizeSessionId(sessionId);
    
    // Properly filter files that belong to this session
    const sessionImages = files.filter(file => {
      // Extract session ID from filename (format: session-XXX-XXX-timestamp.png)
      if (!file.endsWith('.png')) return false;
      
      // Use the normalizeSessionId function to compare properly
      const fileSessionPart = file.substring(0, file.lastIndexOf('-'));
      const normalizedFileId = normalizeSessionId(fileSessionPart);
      
      console.log('Comparing:', {
        file,
        fileSessionPart,
        normalizedFileId,
        normalizedRequestId,
        matches: normalizedFileId === normalizedRequestId
      });
      
      return normalizedFileId === normalizedRequestId;
    });

    console.log('Found images for session:', sessionImages);

    if (sessionImages.length > 0) {
      // Sort by timestamp (extract from filename)
      const sortedImages = sessionImages.sort((a, b) => {
        const getTimestamp = (filename) => {
          const match = filename.match(/-(\d+)\.png$/);
          return match ? parseInt(match[1]) : 0;
        };
        return getTimestamp(b) - getTimestamp(a); // Sort descending (newest first)
      });
      
      const latestImage = sortedImages[0];
      
      // Add cache control headers
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.json({ imagePath: `/api/images/${latestImage}` });
    } else {
      // Return 204 No Content instead of 404 so UI keeps polling
      res.status(204).end();
    }
  } catch (error) {
    console.error('Error in image endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Static file serving (after specific routes)
app.use('/api/images', express.static(IMAGES_DIR));

// Start Express server
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Express API running on http://localhost:${PORT}`);
  // Start the file watcher after server is ready with image callback
  fileWatcher.start((imageData) => {
    // Broadcast new image to all connected clients
    console.log('Broadcasting new image:', imageData);
    server.clients.forEach((client) => {
      if (client.readyState === 1) { // 1 is OPEN state
        client.send(JSON.stringify({
          type: 'newImage',
          payload: imageData,
          timestamp: Date.now()
        }));
      }
    });
  });
});