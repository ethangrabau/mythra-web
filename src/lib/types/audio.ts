// src/types/audio.ts
export interface AudioChunkMetadata {
    type: string;
    chunkId: number;
    timestamp: number;
    size: number;
    checksum: string;
    sessionId: string;
  }
  
  export type SessionStatus = 'recording' | 'initializing' | 'processing' | 'completed' | 'failed';
  
  export interface SessionMetadata {
    sessionId: string;
    startTime: number;
    status: SessionStatus;
    chunks: AudioChunkMetadata[];
    totalDuration: number;
    totalSize: number;
  }
  
  export interface TranscriptionData {
    text: string;
    timestamp: number;
    sessionId: string;
  }
  
  export type WebSocketMessageType = 
    | 'error' 
    | 'command' 
    | 'chunk' 
    | 'ack' 
    | 'status' 
    | 'recording_complete'
    | 'transcription';
  
  export interface ErrorPayload {
    message: string;
  }
  
  export interface CommandPayload {
    action: 'start' | 'stop'; // Limited to 'start' or 'stop' for type safety
    sessionId?: string;
  }
  
  export interface ChunkPayload {
    chunkId: number;
    sessionId: string;
  }
  
  export interface AckPayload {
    chunkId: number;
  }
  
  export interface StatusPayload {
    status: SessionStatus; // Ensures status matches SessionStatus type
  }
  
  export interface RecordingCompletePayload {
    sessionId: string;
  }
  
  export interface TranscriptionPayload extends TranscriptionData {}
  
  export interface WebSocketPayload {
    error: ErrorPayload;
    command: CommandPayload;
    chunk: ChunkPayload;
    ack: AckPayload;
    status: StatusPayload;
    recording_complete: RecordingCompletePayload;
    transcription: TranscriptionPayload;
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
    transcriptions: TranscriptionData[];
    sessionActive: boolean;
    sessionId: string | null;
  }
  