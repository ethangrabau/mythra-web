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
  
  interface StatusPayload {
    status: string;
  }
  
  interface RecordingCompletePayload {
    sessionId: string;
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