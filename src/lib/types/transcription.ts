export interface TranscriptionResponse {
    text: string;
    timestamp: number;
    sessionId: string;
  }
  
  export interface TranscriptionSegment {
    id: string;
    text: string;
    timestamp: number;
    isEditable?: boolean;
  }