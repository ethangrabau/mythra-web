// src/lib/types/audio.ts
export interface AudioChunkMetadata {
    type: string;
    chunkId: number;
    timestamp: number;
    size: number;
    checksum: string;
    sessionId: string;
  }
  
  export interface SessionMetadata {
    sessionId: string;
    startTime: number;
    status: 'initializing' | 'recording' | 'processing' | 'completed' | 'failed';
    chunks: AudioChunkMetadata[];
    totalDuration: number;
    totalSize: number;
    transcription?: TranscriptionData | null;
  }
  
  export type WebSocketMessageType = 'error' | 'command' | 'chunk' | 'ack' | 'status' | 'recording_complete';
  
  interface ErrorPayload {
    message: string;
  }
  
  interface CommandPayload {
    action: string;
  }
  
  interface ChunkPayload {
    chunkId: number;
    sessionId: string;
  }
  
  interface AckPayload {
    chunkId: number;
  }
  
  export interface StatusPayload {
    status: 'initializing' | 'recording' | 'processing' | 'completed' | 'failed';
    sessionId: string;
    duration?: number; // Make optional since not all status messages will have this
    size?: number; // Make optional since not all status messages will have this
    totalDuration?: number; // Add this for compatibility
    totalSize?: number; // Add this for compatibility
  }
  
  export interface RecordingCompletePayload {
    sessionId: string;
    path: string; // Keep your existing fields
    duration: number;
    size: number;
    transcription: TranscriptionData; // Add this field
  }
  
  export type WebSocketPayload = {
    error: ErrorPayload;
    command: CommandPayload;
    chunk: ChunkPayload;
    ack: AckPayload;
    status: StatusPayload;
    recording_complete: RecordingCompletePayload;
  }
  
  export interface WebSocketMessage {
    type: WebSocketMessageType;
    payload: WebSocketPayload[WebSocketMessageType];
    sessionId: string;
    timestamp: number;
  }
  
  export interface AudioRecorderState {
    isRecording: boolean;
    error: string | null;
    audioLevel: number;
    isConnected: boolean;
    sessionData: SessionMetadata | null;
  }

  // Add this interface for transcription data
  export interface TranscriptionData {
    text: string;
    timestamp: number;
    sessionId: string;
  }
