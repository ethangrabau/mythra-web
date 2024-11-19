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

export function useAudioRecorder(): AudioRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionMetadata | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [sessionActive, setSessionActive] = useState(false);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

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
      console.error('WebSocket error:', err);
      setError('Failed to connect to server. Is the server running?');
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('Received message:', message);

        switch (message.type) {
          case 'error': {
            if (message.payload.message?.includes('Session already in progress')) {
              console.log('Session is already active, transitioning to session view.');
              setSessionActive(true);
            } else {
              setError(message.payload.message ?? null);
            }
            break;
          }
          case 'recording_complete': {
            setSessionData((prev) =>
              prev ? { ...prev, status: 'completed' } : defaultSessionData
            );
            if (message.payload.transcription) {
              setTranscriptions((prev = []) => [...prev, message.payload.transcription!]);
            }
            break;
          }
          case 'ack': {
            console.log('Chunk acknowledged:', message.payload.chunkId);
            break;
          }
          case 'status': {
            setSessionData((prev) => ({
              ...(prev || defaultSessionData),
              sessionId: message.payload.sessionId || prev?.sessionId || '',
              status: message.payload.status as SessionStatus,
            }));
            break;
          }
          case 'command': {
            if (message.payload.action === 'start') {
              setSessionActive(true);
              setTranscriptions([]);
            } else if (message.payload.action === 'stop') {
              setIsRecording(false);
            }
            break;
          }
          case 'chunk': {
            console.debug('Received chunk metadata (ignored):', message.payload);
            break;
          }
          case 'transcription': {
            setTranscriptions((prev) => {
              if (message.payload.transcription) {
                return [...prev, message.payload.transcription];
              }
              return prev;
            });
            break;
          }
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    };

    socketRef.current = ws;
  }, [maxReconnectAttempts]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    let frameId: number;

    const updateLevel = () => {
      if (analyserRef.current && isRecording) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
        setAudioLevel(average);
        frameId = requestAnimationFrame(updateLevel);
      }
    };

    if (isRecording && analyserRef.current) {
      updateLevel();
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
    console.log(`isRecording state changed: ${isRecording}`);
  }, [isRecording]);

  const startSession = useCallback(async (providedSessionId?: string) => {
    try {
      if (!isConnected) {
        throw new Error('WebSocket is not connected');
      }

      const newSessionId =
        providedSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const startMessage = createWebSocketMessage(
        'command',
        { action: 'start', sessionId: newSessionId },
        newSessionId
      );

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(startMessage));
        setSessionActive(true);

        setTranscriptions([]);
        setSessionData({
          ...defaultSessionData,
          sessionId: newSessionId,
          startTime: Date.now(),
          status: 'initializing',
        });

        return newSessionId;
      } else {
        throw new Error('WebSocket is not in an open state');
      }
    } catch (err) {
      console.error('Error starting session:', err);
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
  
      let currentSessionId: string;
      if (!sessionActive) {
        currentSessionId = await startSession();
      } else {
        currentSessionId = sessionData?.sessionId ?? '';
        if (!currentSessionId) {
          throw new Error('Invalid session state');
        }
      }
  
      console.log('Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
      // Remove or connect the source as needed:
      // const source = audioContext.createMediaStreamSource(stream);
  
      const recordChunk = async () => {
        if (!isRecording) {
          console.log("Recording stopped, not starting a new chunk.");
          return;
        }
      
        console.log("Starting a new chunk...");
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : 'audio/ogg;codecs=opus',
        });
      
        mediaRecorder.onstart = () => {
          console.log("MediaRecorder started for a new chunk");
        };
      
        mediaRecorder.onstop = () => {
          console.log("MediaRecorder stopped for this chunk");
        };
      
        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0) {
            console.log(`Chunk recorded: ${event.data.size} bytes`);
            const arrayBuffer = await event.data.arrayBuffer();
      
            // Send chunk to WebSocket server
            if (socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(arrayBuffer);
              console.log("Chunk sent to server");
            }
          } else {
            console.warn("Empty chunk received");
          }
        };
      
        mediaRecorder.onerror = (e) => {
          console.error("MediaRecorder error:", e);
          stopRecording(); // Stop if there's an error
        };
      
        mediaRecorder.start();
        setTimeout(() => {
          if (mediaRecorder.state !== "inactive") {
            console.log("Stopping MediaRecorder for this chunk...");
            mediaRecorder.stop();
      
            if (isRecording) {
              console.log("Triggering next chunk...");
              recordChunk(); // Start the next chunk
            } else {
              console.log("Recording has stopped, not triggering the next chunk.");
            }
          }
        }, 10000); // 10-second chunk duration
      };            
  
      recordChunk(); // Start the first chunk
      setIsRecording(true);
  
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [isConnected, sessionActive, sessionData, startSession, isRecording]);
  

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');

    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      setIsRecording(false);
      setAudioLevel(0);
    }
  }, []);

  const endSession = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    if (sessionData?.sessionId) {
      const endMessage = createWebSocketMessage('command', {
        action: 'end',
        sessionId: sessionData.sessionId
      }, sessionData.sessionId);
      sendWebSocketMessage(endMessage);
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
    audioLevel,
    isConnected,
    sessionData,
    transcriptions,
    sessionActive,
    sessionId: sessionData?.sessionId ?? null,
    startSession,
  };
}
