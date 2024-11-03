// server.mjs
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { createWriteStream, mkdirSync } from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create directories for storing audio files
const AUDIO_DIR = join(__dirname, 'audio-chunks');
const RECORDINGS_DIR = join(__dirname, 'recordings');
console.log('=== Initializing Server ===');
console.log('Audio directories created at:', {
  AUDIO_DIR,
  RECORDINGS_DIR
});

// Ensure directories exist synchronously before proceeding
try {
  mkdirSync(AUDIO_DIR, { recursive: true });
  mkdirSync(RECORDINGS_DIR, { recursive: true });
  console.log('Audio directories created/verified');
} catch (error) {
  console.error('Failed to create directories:', error);
  process.exit(1);  // Exit if we can't create directories
}

const server = new WebSocketServer({ port: 8080 });
console.log('WebSocket server running on ws://localhost:8080');

async function concatenateChunks(sessionDir, sessionId) {
  console.log(`Starting concatenation for session ${sessionId}`);
  try {
    // Get all chunks in order
    const files = await fs.readdir(sessionDir);
    console.log('Found files:', files.join(', '));
    
    const chunkFiles = files
      .filter(f => f.startsWith('chunk-') && f.endsWith('.webm'))
      .sort((a, b) => {
        const numA = parseInt(a.split('-')[1]);
        const numB = parseInt(b.split('-')[1]);
        return numA - numB;
      });
    
    console.log('Sorted chunk files:', chunkFiles.join(', '));

    if (chunkFiles.length === 0) {
      throw new Error('No chunk files found in directory');
    }

    // Create complete recording file
    const outputPath = join(RECORDINGS_DIR, `recording-${sessionId}.webm`);
    console.log('Creating output file at:', outputPath);
    
    const outputStream = createWriteStream(outputPath);
    
    // Concatenate all chunks
    for (const file of chunkFiles) {
      const chunkPath = join(sessionDir, file);
      console.log(`Reading chunk: ${file}`);
      const chunkData = await fs.readFile(chunkPath);
      console.log(`Writing chunk: ${file} (${chunkData.length} bytes)`);
      outputStream.write(chunkData);
    }
    
    return new Promise((resolve, reject) => {
      outputStream.on('finish', () => {
        console.log(`Recording saved: recording-${sessionId}.webm`);
        resolve(outputPath);
      });
      outputStream.on('error', (error) => {
        console.error('Error writing output:', error);
        reject(error);
      });
      outputStream.end();
    });
  } catch (error) {
    console.error('Error in concatenateChunks:', error);
    throw error;
  }
}

server.on('connection', (socket) => {
  console.log('=== New Client Connected ===');
  
  // Create a session ID and directory for this connection
  const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDir = join(AUDIO_DIR, sessionId);
  let chunkCounter = 0;
  let isRecording = false;

  // Create session directory
  fs.mkdir(sessionDir, { recursive: true })
    .then(() => console.log('Session directory created:', sessionDir))
    .catch(error => console.error('Error creating session directory:', error));

  socket.on('message', async (data, isBinary) => {
    console.log('=== Received Message ===');
    console.log('Is Binary:', isBinary);
    
    try {
      if (isBinary) {
        // Handle binary data (audio chunks)
        isRecording = true;
        const chunkPath = join(sessionDir, `chunk-${chunkCounter}.webm`);
        await fs.writeFile(chunkPath, data);
        console.log(`Saved audio chunk ${chunkCounter} for session ${sessionId}`);
        chunkCounter++;

        socket.send(JSON.stringify({
          type: 'ack',
          chunkId: chunkCounter - 1,
          sessionId
        }));
      } else {
        // Handle text/JSON messages
        const messageStr = data.toString();
        console.log('Text message received:', messageStr);
        
        try {
          const message = JSON.parse(messageStr);
          console.log('Parsed message:', message);
          console.log('Recording state:', { isRecording, chunkCounter });

          if (message.type === 'command' && message.action === 'stop') {
            console.log('=== Processing Stop Command ===');
            try {
              // List directory contents
              const files = await fs.readdir(sessionDir);
              console.log('Directory contents:', files);
              
              if (files.length > 0) {
                console.log('Starting concatenation...');
                const outputPath = await concatenateChunks(sessionDir, sessionId);
                console.log('Concatenation complete:', outputPath);
                
                // Verify the file was created
                try {
                  await fs.access(outputPath);
                  console.log('Output file verified at:', outputPath);
                  
                  socket.send(JSON.stringify({
                    type: 'recording_complete',
                    sessionId,
                    path: outputPath
                  }));
                } catch (err) {
                  console.error('Failed to verify output file:', err);
                }
              } else {
                console.log('No files found to concatenate');
              }
              
              isRecording = false;
            } catch (error) {
              console.error('Error processing stop command:', error);
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process recording'
              }));
            }
          }
        } catch (parseError) {
          console.error('Failed to parse message:', parseError, 'Raw message:', messageStr);
        }
      }
    } catch (error) {
      console.error('Error in message handler:', error);
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');
    console.log(`Session ${sessionId} ended with ${chunkCounter} chunks recorded`);
  });

  socket.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Log active connections every 30 seconds
setInterval(() => {
  console.log(`Active connections: ${server.clients.size}`);
}, 30000);