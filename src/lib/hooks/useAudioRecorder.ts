// src/lib/hooks/useAudioRecorder.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { calculateChecksum } from '../utils/audio';
import {
  AudioChunkMetadata,
  SessionMetadata,
  WebSocketMessage,
  TranscriptionData,
  SessionStatus,
  WebSocketPayload,
  defaultSessionData,
  AudioRecorderHook,
  WebSocketMessageType
} from '../types/audio';

interface WindowWithAudioContext extends Window {
  webkitAudioContext: typeof AudioContext;
}

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

    ws.onmessage = async event => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        console.log('Received message:', message);

        switch (message.type) {
          case 'error': {
            setError(message.payload.message ?? null);
            break;
          }
          case 'recording_complete': {
            setSessionData(prev => prev ? { ...prev, status: 'completed' } : defaultSessionData);
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
            console.log('WebSocket status update received:', message.payload);
          
            // Update session data with session ID and status
            setSessionData((prev) => {
              const newData = {
                ...(prev || defaultSessionData),
                sessionId: message.payload.sessionId || prev?.sessionId || '', // Ensure sessionId is always populated
                status: message.payload.status as SessionStatus, // Ensure correct type
              };
              return newData;
            });
          
            // Log session ID for debugging
            if (message.payload.sessionId) {
              console.log('Updated session ID:', message.payload.sessionId);
            } else {
              console.warn('No session ID provided in status payload.');
            }
            break;
          }
          case 'command': {
            if (message.payload.action === 'start') {
              setSessionActive(true);
              setTranscriptions([]);
            } else if (message.payload.action === 'stop') {
              setIsRecording(false);
            }
            console.log('Command received:', message.payload.action);
            break;
          }
          case 'chunk': {
            console.log('Chunk message:', message.payload);
            break;
          }
          case 'transcription': {
            setTranscriptions((prev) => {
              // Add transcription only if it's unique (avoid duplicates)
              if (
                message.payload.transcription &&
                (!prev.length || prev[prev.length - 1].timestamp !== message.payload.transcription.timestamp)
              ) {
                return [...prev, message.payload.transcription];
              }
              return prev;
            });
            console.log('Transcription received:', message.payload.transcription);
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
  }, [isRecording]);

  const startSession = useCallback(async (providedSessionId?: string) => {
    try {
      let attempts = 0;
      while (!isConnected && attempts < 5) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }
  
      if (!isConnected) {
        throw new Error('Failed to establish WebSocket connection');
      }
  
      const newSessionId = providedSessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const startMessage = createWebSocketMessage('command', { action: 'start', sessionId: newSessionId }, newSessionId);
  
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
        throw new Error('WebSocket not connected');
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
      
      const AudioContext = window.AudioContext || (window as unknown as WindowWithAudioContext).webkitAudioContext;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      if (!sessionActive) {
        setSessionData({
          ...defaultSessionData,
          sessionId: currentSessionId,
          startTime: Date.now(),
          status: 'recording'
        });
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          try {
            const arrayBuffer = await event.data.arrayBuffer();
            const checksum = await calculateChecksum(arrayBuffer);
            socketRef.current.send(arrayBuffer);
            
            const metadata: AudioChunkMetadata = {
              type: 'metadata',
              chunkId: sessionData?.chunks?.length ?? 0,
              timestamp: Date.now(),
              size: arrayBuffer.byteLength,
              checksum,
              sessionId: currentSessionId
            };

            const message = createWebSocketMessage('chunk', metadata, currentSessionId);
            sendWebSocketMessage(message);
            
            setSessionData(prev => {
              if (!prev) return null;
              return {
                ...prev,
                chunks: [...(prev.chunks || []), metadata],
                totalSize: prev.totalSize + arrayBuffer.byteLength,
                totalDuration: prev.totalDuration + 1000
              };
            });
          } catch (err) {
            console.error('Error sending audio chunk:', err);
            setError('Failed to send audio chunk');
          }
        }
      };

      recorder.start(1000);
      mediaRecorder.current = recorder;
      setIsRecording(true);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [isConnected, sendWebSocketMessage, sessionActive, sessionData, startSession]);

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

      const stopMessage = createWebSocketMessage('command', {
        action: 'stop'
      }, sessionData?.sessionId ?? '');

      sendWebSocketMessage(stopMessage);

      setIsRecording(false);
      setAudioLevel(0);
      setSessionData(prev => prev ? { ...prev, status: 'processing' } : defaultSessionData);
    }
  }, [sessionData, sendWebSocketMessage]);

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