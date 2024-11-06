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
  transcription?: TranscriptionData | null; 
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
  sessionId?: string; // Add sessionId as an optional field
}

export interface RecordingCompletePayload {
  sessionId: string;
  path: string; // Keep your existing fields
  duration: number;
  size: number;
  transcription: TranscriptionData; // Add this field
}

export interface TranscriptionPayload extends TranscriptionData {
  // Any additional properties specific to the payload
  id?: string;  // for example
}

export interface WebSocketPayload {
  error: ErrorPayload;
  command: CommandPayload;
  chunk: ChunkPayload;
  ack: AckPayload;
  status: StatusPayload;
  recording_complete: RecordingCompletePayload;
  transcription: TranscriptionPayload;
  sessionId?: string; // Add sessionId as an optional field
}

export interface WebSocketMessage {
  type: 'command' | 'chunk' | 'status' | 'error' | 'recording_complete' | 'ack' | 'transcription';
  payload: WebSocketPayload[WebSocketMessage['type']];  // This makes payload type match the message type
  sessionId: string;
  timestamp: number;
}

export interface AudioRecorderState {
  isRecording: boolean;
  error: string | null;
  audioLevel: number;
  isConnected: boolean;
  sessionData: SessionMetadata | null;
  transcriptionData: TranscriptionData | null;  // Add this line
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}
