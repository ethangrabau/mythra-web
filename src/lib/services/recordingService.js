// src/lib/services/recordingService.js
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { PATHS } from '../constants/paths.js';


ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export class RecordingService {
    constructor() {
      this.sessions = new Map();
      this.CHUNK_DURATION = 10;
      this.AUDIO_DIR = PATHS.AUDIO_DIR;
      
      console.log('RecordingService initialized with AUDIO_DIR:', this.AUDIO_DIR);
      if (!fs.existsSync(this.AUDIO_DIR)) {
        fs.mkdirSync(this.AUDIO_DIR, { recursive: true });
      }
    }
  
    startRecording(sessionId, onChunkComplete) {
      console.log(`[RecordingService] Starting/Resuming recording for session: ${sessionId}`);
      
      // Check if session exists and is in a valid state
      const existingSession = this.sessions.get(sessionId);
      if (existingSession) {
        if (existingSession.isRecording) {
          throw new Error('Session already recording');
        }
        if (existingSession.isStopping) {
          throw new Error('Session is currently stopping');
        }
      }
      
      // Create session directory if needed
      const sessionDir = path.join(this.AUDIO_DIR, sessionId);
      console.log(`[RecordingService] Session directory: ${sessionDir}`);
      
      if (!fs.existsSync(sessionDir)) {
        console.log(`[RecordingService] Creating new session directory`);
        fs.mkdirSync(sessionDir, { recursive: true });
      }
    
      // Initialize or get session data
      let sessionData = existingSession || {
        process: null,
        lastChunkId: -1,
        startTime: Date.now(),
        isRecording: false,
        isStopping: false
      };
    
      console.log(`[RecordingService] Session data:`, sessionData);
    
      if (sessionData.process) {
        console.log(`[RecordingService] Cleaning up existing process`);
        sessionData.process.kill('SIGTERM');
        sessionData.process = null;
      }
    
      sessionData.isRecording = true;
      sessionData.isStopping = false;
    
      const recordChunk = () => {
        if (!sessionData.isRecording) {
          console.log(`[RecordingService] Recording stopped for session ${sessionId}`);
          return;
        }
  
        const chunkId = sessionData.lastChunkId + 1;
        const filename = path.join(sessionDir, `chunk-${chunkId}.webm`);
        console.log(`[RecordingService] Starting chunk ${chunkId} recording to ${filename}`);
  
        const process = ffmpeg()
          .input(':0')
          .inputFormat('avfoundation')
          .audioCodec('libopus')
          .format('webm')
          .duration(this.CHUNK_DURATION)
          .on('start', (cmd) => {
            console.log(`[RecordingService] Recording chunk ${chunkId} started with command: ${cmd}`);
          })
          .on('end', () => {
            console.log(`[RecordingService] Chunk ${chunkId} recording completed`);
            
            // Verify file exists and has content
            if (fs.existsSync(filename)) {
              const stats = fs.statSync(filename);
              console.log(`[RecordingService] Chunk ${chunkId} file size: ${stats.size} bytes`);
              
              if (stats.size > 0) {
                sessionData.lastChunkId = chunkId;
                
                // Wait a moment for the file to be fully written
                setTimeout(() => {
                  onChunkComplete(sessionId, chunkId, filename);
                  
                  // Start next chunk if still recording
                  if (sessionData.isRecording) {
                    console.log(`[RecordingService] Starting next chunk`);
                    setTimeout(recordChunk, 0);
                  }
                }, 100);
              } else {
                console.error(`[RecordingService] Chunk ${chunkId} is empty`);
                if (sessionData.isRecording) {
                  recordChunk();
                }
              }
            } else {
              console.error(`[RecordingService] Chunk ${chunkId} was not created`);
              if (sessionData.isRecording) {
                recordChunk();
              }
            }
          })
          .on('error', (err) => {
            console.error(`[RecordingService] Error during recording chunk ${chunkId}:`, err.message);
            if (sessionData.isRecording) {
              recordChunk();
            }
          })
          .save(filename);
  
        sessionData.process = process;
      };
  
      this.sessions.set(sessionId, sessionData);
      recordChunk();
      
      return sessionData;
    }
  
    stopRecording(sessionId) {
      console.log(`[RecordingService] Stopping recording for session: ${sessionId}`);
      const session = this.sessions.get(sessionId);
      
      if (!session) {
        console.warn(`[RecordingService] No session found for ID: ${sessionId}`);
        return Promise.resolve();
      }
    
      session.isStopping = true;
      session.isRecording = false;
      
      return new Promise((resolve) => {
        if (session.process) {
          console.log(`[RecordingService] Killing ffmpeg process`);
          
          // Handle process termination
          session.process.on('close', () => {
            console.log(`[RecordingService] ffmpeg process terminated`);
            session.process = null;
            session.isStopping = false;
            session.lastChunkId = -1;
            this.sessions.set(sessionId, {
              ...session,
              process: null,
              isRecording: false,
              isStopping: false,
              lastChunkId: -1
            });
            resolve();
          });
    
          // Add error handler
          session.process.on('error', (err) => {
            console.log(`[RecordingService] Process error:`, err);
            session.process = null;
            session.isStopping = false;
            resolve();  // Resolve even on error
          });
    
          try {
            session.process.kill('SIGTERM');
          } catch (err) {
            console.error('[RecordingService] Error killing process:', err);
            session.process = null;
            session.isStopping = false;
            resolve();  // Resolve if kill fails
          }
        } else {
          session.isStopping = false;
          resolve();
        }
      });
    }
  
    isRecording(sessionId) {
      const session = this.sessions.get(sessionId);
      return session?.isRecording || false;
    }
  
    getSessionData(sessionId) {
      return this.sessions.get(sessionId);
    }
  }