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
  WebSocketMessageType
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

  const sendWebSocketMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    console.log('Initializing WebSocket connection...', process.env.NEXT_PUBLIC_WS_URL);
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      setError(null);
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected', event.code, event.reason);
      setIsConnected(false);
      setIsRecording(false); // Ensure recording state is reset on disconnect

      if (reconnectAttempts.current < maxReconnectAttempts) {
        console.log(`Attempting to reconnect (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        setTimeout(connectWebSocket, delay);
      } else {
        setError('Unable to connect to server. Please check if the server is running and refresh the page.');
      }
    };

    ws.onerror = (err) => {
      console.warn('WebSocket error:', err);
      
      // Suppress connection-related errors
      if (!isConnected) {
        console.warn('Suppressing WebSocket connection error');
        return;
      }
    
      setError('Failed to connect to server. Is the server running?');
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('Received message:', message);

        switch (message.type) {
          case 'error': {
            setError(message.payload.message || null);
            break;
          }
          case 'recording_complete': {
            setIsRecording(false);
            setSessionData((prev) =>
              prev ? { ...prev, status: 'completed' } : defaultSessionData
            );
            if (message.payload.transcription) {
              setTranscriptions((prev) => [...prev, message.payload.transcription!]);
            }
            break;
          }
          case 'status': {
            console.log('Frontend: Received status update:', message.payload.status);
            console.log('Frontend: Current isRecording state before update:', isRecording);
            setSessionData((prev) => ({
              ...(prev || defaultSessionData),
              sessionId: message.payload.sessionId || prev?.sessionId || '',
              status: message.payload.status as SessionStatus,
            }));
          
            // Update recording state based on status
            if (message.payload.status === 'recording' && sessionActive) { // Only set to true if sessionActive
              console.log('Frontend: Setting recording state to true');
              setIsRecording(true);
              console.log('isRecording updated to true:', isRecording);
            } else if (['completed', 'failed', 'stopped'].includes(message.payload.status || '')) {
              console.log('Setting recording state to false');
              setIsRecording(false);
            }
            break;
          }
          case 'transcription': {
            console.log('Frontend: Received transcription message:', message);
          
            if (message.payload.transcription) {
              const transcription = message.payload.transcription;
          
              // Ensure transcription is of type TranscriptionData
              if (transcription && typeof transcription.text === 'string' && typeof transcription.timestamp === 'number') {
                console.log('Frontend: Adding transcription:', transcription);
          
                setTranscriptions((prev) => {
                  const updated = [...prev, transcription];
                  console.log('Frontend: Updated transcriptions state:', updated);
                  return updated;
                });
              } else {
                console.error('Invalid transcription data received:', transcription);
              }
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
  }, [sessionActive]);

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