// src/lib/types/audio.ts

export interface AudioChunkMetadata {
  type: 'metadata';
  chunkId: number;
  timestamp: number;
  size: number;
  checksum: string;
  sessionId: string;
  [key: string]: unknown; // Allow additional fields
}

export type SessionStatus =
  | 'recording'
  | 'initializing'
  | 'processing'
  | 'transcribing'
  | 'completed'
  | 'stopped'
  | 'ready'
  | 'failed';

export interface SessionMetadata {
  sessionId: string; // Unique ID for the session
  startTime: number; // Timestamp when the session started
  status: SessionStatus; // Current session status
  chunks: AudioChunkMetadata[]; // List of audio chunks
  totalDuration: number; // Total duration of audio in milliseconds
  totalSize: number; // Total size of all chunks in bytes
  lastChunkId: number; // Last processed chunk ID
  checksums: string[]; // List of checksums for chunk validation
  transcription: TranscriptionData | null; // Final transcription (if available)
}

export interface TranscriptionData {
  text: string; // Transcribed text
  timestamp: number; // Timestamp when the transcription was created
  sessionId: string; // Associated session ID
}

export type WebSocketMessageType =
  | 'command'
  | 'chunk'
  | 'status'
  | 'error'
  | 'recording_complete'
  | 'ack'
  | 'transcription'
  | 'session_ended';

export interface WebSocketMessage {
  type: WebSocketMessageType; // Type of WebSocket message
  payload: WebSocketPayload; // Message payload
  sessionId: string; // Session ID associated with the message
  timestamp: number; // Timestamp of the message
}

export interface WebSocketPayload {
  message?: string; // Optional error or status message
  status?: SessionStatus; // Current session status
  sessionId?: string; // Session ID for context
  action?: 'start' | 'stop' | 'end' | 'startRecording'; // Action being requested
  chunkId?: number; // ID of the audio chunk
  duration?: number; // Duration of the audio chunk
  size?: number; // Size of the audio chunk in bytes
  transcription?: TranscriptionData; // Transcription data (if available)
  path?: string; // Path to a recording file
  [key: string]: unknown; // Allow additional fields with unknown type
}

// Function type for creating WebSocket messages
export type CreateWebSocketMessage = <T extends WebSocketMessageType>(
  type: T,
  payload: WebSocketPayload,
  sessionId: string
) => WebSocketMessage;

// Default session data to use as a fallback
export const defaultSessionData: SessionMetadata = {
  sessionId: '',
  startTime: Date.now(),
  status: 'initializing',
  chunks: [],
  totalDuration: 0,
  totalSize: 0,
  lastChunkId: -1,
  checksums: [],
  transcription: null,
};

// Hook return type for the audio recorder
export interface AudioRecorderHook {
  isRecording: boolean; // Is recording currently active
  error: string | null; // Current error message (if any)
  audioLevel: number; // Current audio level (for visualization)
  isConnected: boolean; // Is the WebSocket connection active
  sessionData: SessionMetadata | null; // Metadata for the current session
  transcriptions: TranscriptionData[]; // List of received transcriptions
  sessionActive: boolean; // Is the session currently active
  sessionId: string | null; // Current session ID
  startSession: (providedSessionId?: string) => Promise<string>; // Start a new session
  startRecording: () => Promise<void>; // Start recording
  stopRecording: () => void; // Stop recording
  endSession: () => void; // End the current session
}
