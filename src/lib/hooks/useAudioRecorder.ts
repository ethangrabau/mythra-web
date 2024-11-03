// useAudioRecorder.ts
"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
  audioLevel: number;
  isConnected: boolean;  // WebSocket connection status
}

interface WindowWithAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    console.log("Initializing WebSocket connection...");

    const socket = new WebSocket('ws://localhost:8080'); // Use WebSocket API directly

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      console.log('Received message from server:', event.data);
    };

    socket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      setError('Connection error');
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    socketRef.current = socket;

    return () => {
      console.log("Cleaning up WebSocket connection...");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Monitor audio levels when recording
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
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isRecording]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      console.log('Starting recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got media stream');
      
      const windowWithAudio = window as WindowWithAudioContext;
      const AudioContextClass = window.AudioContext || windowWithAudio.webkitAudioContext;
      
      if (!AudioContextClass) {
        throw new Error('AudioContext not supported in this browser');
      }
      
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      console.log('Audio analysis setup complete');

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      recorder.ondataavailable = async (event: BlobEvent) => {
        if (event.data.size > 0) {
          console.log('Audio data chunk size:', event.data.size);
          
          // Convert blob to ArrayBuffer and send through WebSocket
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            try {
              const arrayBuffer = await event.data.arrayBuffer();
              socketRef.current.send(arrayBuffer);
              console.log('Sent audio chunk through WebSocket');
            } catch (error) {
              console.error('Error sending audio chunk:', error);
            }
          }
        }
      };

      recorder.start(1000);  // Collect chunks every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      console.log('Recording started');

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
      }
  
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Updated stop message sending
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        console.log('Sending stop message to server');
        const stopMessage = JSON.stringify({
          type: 'command',
          action: 'stop'
        });
        console.log('Stop message content:', stopMessage);  // Debug log
        socketRef.current.send(stopMessage);
      } else {
        console.log('WebSocket not ready to send stop message');
      }
      
      setIsRecording(false);
      setAudioLevel(0);
      console.log('Recording stopped');
    }
  }, [mediaRecorder]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    audioLevel,
    isConnected
  };
}
