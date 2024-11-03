// src/lib/hooks/useAudioRecorder.ts
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { calculateChecksum } from '../utils/audio';
import type { 
  AudioChunkMetadata, 
  SessionMetadata, 
  WebSocketMessage, 
  AudioRecorderState,
  WebSocketPayload 
} from '../types/audio';

// Add this interface at the top of the file
interface WindowWithAudioContext extends Window {
  webkitAudioContext: typeof AudioContext;
}

export function useAudioRecorder(): AudioRecorderState & {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
} {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionMetadata | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
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

    console.log('Initializing WebSocket connection...');
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      setError(null);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        setTimeout(connectWebSocket, delay);
      } else {
        setError('Connection lost. Please refresh the page.');
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error occurred');
    };

    ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('Received message:', message);
    
          switch (message.type) {
            case 'error': {
              const errorPayload = message.payload as WebSocketPayload['error'];
              setError(errorPayload.message);
              break;
            }
            case 'recording_complete': {
              setSessionData(prev => prev ? { ...prev, status: 'completed' } : null);
              break;
            }
            case 'ack': {
              const ackPayload = message.payload as WebSocketPayload['ack'];
              console.log('Chunk acknowledged:', ackPayload.chunkId);
              break;
            }
            case 'status': {
              const statusPayload = message.payload as WebSocketPayload['status'];
              console.log('Status update:', statusPayload.status);
              break;
            }
            case 'command': {
              const commandPayload = message.payload as WebSocketPayload['command'];
              console.log('Command received:', commandPayload.action);
              break;
            }
            case 'chunk': {
              const chunkPayload = message.payload as WebSocketPayload['chunk'];
              console.log('Chunk message:', chunkPayload);
              break;
            }
            default: {
              console.warn('Unknown message type:', message);
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

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      if (!isConnected) {
        throw new Error('Not connected to server');
      }
  
      // Initialize session first
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Send start message to server
      const startMessage: WebSocketMessage = {
        type: 'command',
        payload: { action: 'start', sessionId },
        sessionId,
        timestamp: Date.now()
      };
      
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(startMessage));
      } else {
        throw new Error('WebSocket not connected');
      }
  
      console.log('Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Fixed AudioContext initialization
      const AudioContext = window.AudioContext || 
        ((window as unknown as WindowWithAudioContext).webkitAudioContext);
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      
      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      // Initialize session with correct type
      const newSessionData: SessionMetadata = {
        sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime: Date.now(),
        status: 'recording',
        chunks: [],
        totalDuration: 0,
        totalSize: 0
      };
      setSessionData(newSessionData);

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          try {
            const arrayBuffer = await event.data.arrayBuffer();
            const checksum = await calculateChecksum(arrayBuffer);
            
            // Send audio chunk
            socketRef.current.send(arrayBuffer);
            
            // Create metadata with correct type
            const metadata: AudioChunkMetadata = {
              type: 'metadata',
              chunkId: sessionData?.chunks.length ?? 0,
              timestamp: Date.now(),
              size: arrayBuffer.byteLength,
              checksum,
              sessionId: newSessionData.sessionId
            };

            // Send metadata as WebSocketMessage
            const message: WebSocketMessage = {
              type: 'chunk',
              payload: metadata,
              sessionId: newSessionData.sessionId,
              timestamp: Date.now()
            };

            sendWebSocketMessage(message);
            
            // Update session data
            setSessionData(prev => {
              if (!prev) return null;
              return {
                ...prev,
                chunks: [...prev.chunks, metadata],
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

      recorder.start(1000); // 1 second chunks
      mediaRecorder.current = recorder;
      setIsRecording(true);

    } catch (err) {
        console.error('Error starting recording:', err);
        setError(err instanceof Error ? err.message : 'Failed to start recording');
      }
    }, [isConnected, sendWebSocketMessage]);

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

      const stopMessage: WebSocketMessage = {
        type: 'command',
        payload: { action: 'stop' },
        sessionId: sessionData?.sessionId ?? '',
        timestamp: Date.now()
      };

      sendWebSocketMessage(stopMessage);

      setIsRecording(false);
      setAudioLevel(0);
      setSessionData(prev => prev ? { ...prev, status: 'processing' } : null);
    }
  }, [sessionData, sendWebSocketMessage]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    audioLevel,
    isConnected,
    sessionData
  };
}