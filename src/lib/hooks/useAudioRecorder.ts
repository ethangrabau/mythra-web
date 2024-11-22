// src/lib/hooks/useAudioRecorder.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  SessionMetadata, 
  WebSocketMessage, 
  TranscriptionData, 
  SessionStatus, 
  WebSocketPayload,
  defaultSessionData,
  AudioRecorderHook,
  WebSocketMessageType,
  QueuedMessage  // Add this import
} from '../types/audio';


const createWebSocketMessage = (
  type: WebSocketMessageType,
  payload: WebSocketPayload,
  sessionId: string
): WebSocketMessage => ({
  type,
  payload,
  sessionId,
  timestamp: Date.now()
});

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionMetadata | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [sessionActive, setSessionActive] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const lastMessageRef = useRef<string | null>(null);
  const messageQueue = useRef<QueuedMessage[]>([]);


  useEffect(() => {
    console.log('Debug - transcriptions state updated:', {
      count: transcriptions.length,
      transcriptions,
      isRecording,
      sessionActive
    });
  }, [transcriptions, isRecording, sessionActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        console.log('Debug - Connection Status:', {
          isConnected,
          socketState: socketRef.current?.readyState,
          transcriptionCount: transcriptions.length,
          sessionActive,
          isRecording,
          sessionId: sessionData?.sessionId
        });
      }
    }, 5000);
  
    return () => clearInterval(interval);
  }, [isConnected, transcriptions.length, sessionActive, isRecording, sessionData]);

  const sendWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    // Early return if already connected
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected, skipping connection attempt');
      return;
    }
  
    // Close existing connection if any
    if (socketRef.current) {
      console.log('Closing existing WebSocket connection');
      socketRef.current.close();
    }
  
    console.log('Initializing WebSocket connection...', process.env.NEXT_PUBLIC_WS_URL);
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
  
    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      setError(null);
    };
  
    ws.onclose = (event) => {
      console.log('Debug - WebSocket disconnected:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`Debug - Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        reconnectAttempts.current++;
        // Use fixed delay instead of exponential
        setTimeout(connectWebSocket, 2000);
      }
    };
  
    ws.onerror = (err) => {
      console.warn('WebSocket error:', err);
      
      if (!isConnected) {
        console.warn('Suppressing WebSocket connection error');
        return;
      }
      
      setError('Failed to connect to server. Is the server running?');
    };
  
    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('Debug - Received WebSocket message:', message);
    
        const messageKey = `${message.type}-${message.timestamp}`;
        if (lastMessageRef.current === messageKey) {
          console.log('Debug - Duplicate message detected, skipping');
          return;
        }
        lastMessageRef.current = messageKey;
    
        switch (message.type) {
          case 'transcription': {
            console.log('Debug - Processing transcription message:', message);
          
            if (message.payload.transcription) {
              const transcription = message.payload.transcription;
              
              setTranscriptions(prev => {
                const updated = [...(prev || []), transcription];
                console.log('Transcriptions updated:', {
                  previousCount: prev?.length || 0,
                  newCount: updated.length,
                  latest: transcription.text
                });
                return updated;
              });
            }
            break;
          }
          case 'status': {
            console.log('Debug - Processing status update:', {
              newStatus: message.payload.status,
              currentStatus: sessionData?.status,
              isRecording,
              sessionActive
            });
    
            setSessionData((prev) => ({
              ...(prev || defaultSessionData),
              sessionId: message.payload.sessionId || prev?.sessionId || '',
              status: message.payload.status as SessionStatus,
              lastUpdate: Date.now()
            }));
          
            if (message.payload.status === 'recording' && sessionActive) {
              console.log('Debug - Setting recording to true');
              setIsRecording(true);
            } else if (['completed', 'failed', 'stopped'].includes(message.payload.status || '')) {
              console.log('Debug - Setting recording to false');
              setIsRecording(false);
            }
            break;
          }
          
          case 'session_ended': {
            setIsRecording(false);
            setSessionActive(false);
            setTranscriptions([]);
            setSessionData(null);
            break;
          }
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    };
  
    socketRef.current = ws;
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  const startSession = useCallback(async (providedSessionId?: string) => {
    try {
      if (!isConnected) {
        throw new Error('WebSocket is not connected');
      }
  
      const newSessionId = 
        providedSessionId || `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  
      const message = {
        type: 'command',
        payload: { action: 'start', sessionId: newSessionId },
        sessionId: newSessionId,
      };
  
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(message));
        setSessionActive(true);  // Changed this to true
        setTranscriptions([]);
        setSessionData({
          ...defaultSessionData,
          sessionId: newSessionId,
          startTime: Date.now(),
          status: 'ready',
        });
        return newSessionId;
      } else {
        throw new Error('WebSocket is not in an open state');
      }
    } catch (err) {
      console.warn('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
      throw err;
    }
  }, [isConnected]);  
  

  const startRecording = useCallback(async () => {
    try {
      setError(null);
  
      if (!isConnected) {
        throw new Error('Not connected to server');
      }
  
      let currentSessionId = sessionData?.sessionId;
  
      // If no session is active, start a new session
      if (!sessionActive) {
        currentSessionId = await startSession();
      }
  
      if (!currentSessionId) {
        throw new Error('Invalid session state');
      }
  
      // Prepare the WebSocket message
      const message: WebSocketMessage = {
        type: 'command', // Valid type from WebSocketMessageType
        payload: {
          action: 'startRecording', // Valid action from WebSocketPayload
          sessionId: currentSessionId,
        },
        sessionId: currentSessionId,
        timestamp: Date.now(), // Add a timestamp for the message
      };
  
      sendWebSocketMessage(message); // Send the message
      console.log('Frontend: Sent startRecording message to server');
  
      setIsRecording(true); // Update recording state
      console.log('isRecording updated to true:', isRecording);
    } catch (err) {
      console.warn('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [isConnected, isRecording, sessionActive, sessionData, startSession, sendWebSocketMessage]);
  
  const stopRecording = useCallback(() => {
    try {
      console.log('Frontend: Initiating stop recording...');
  
      if (!sessionData?.sessionId) {
        throw new Error('No active session found for stop recording');
      }
  
      // Prepare the WebSocket message
      const message: WebSocketMessage = {
        type: 'command', // Valid type from WebSocketMessageType
        payload: {
          action: 'stop', // Valid action from WebSocketPayload
          sessionId: sessionData.sessionId,
        },
        sessionId: sessionData.sessionId,
        timestamp: Date.now(), // Add a timestamp for the message
      };
  
      sendWebSocketMessage(message); // Send the message
      console.log('Frontend: Sent stop command for session:', sessionData.sessionId);
  
      setIsRecording(false); // Update recording state
    } catch (err) {
      console.warn('Error stopping recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  }, [sessionData, sendWebSocketMessage]);
  
  
  
  

  const endSession = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    if (sessionData?.sessionId) {
      const message = createWebSocketMessage(
        'command',
        { action: 'end', sessionId: sessionData.sessionId },
        sessionData.sessionId
      );
      sendWebSocketMessage(message);
    }
    setSessionActive(false);
    setTranscriptions([]);
    setSessionData(null);
  }, [isRecording, stopRecording, sessionData, sendWebSocketMessage]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    endSession,
    error,
    audioLevel: 0,
    isConnected,
    sessionData,
    transcriptions,
    sessionActive,
    sessionId: sessionData?.sessionId ?? null,
    startSession,
  };
}