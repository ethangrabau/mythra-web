// useAudioRecorder.ts
"use client";

import { useState, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => void
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startRecording = useCallback(async () => {
    try {
      // Reset error state
      setError(null)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create new MediaRecorder instance
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      // Handle the data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Here we'll eventually send the audio chunk to our backend
          console.log('Audio chunk received:', event.data.size, 'bytes')
        }
      }

      // Start recording
      recorder.start(1000) // Collect data in 1-second chunks
      setMediaRecorder(recorder)
      setIsRecording(true)

    } catch (err) {
      console.error('Error starting recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }, [mediaRecorder])

  return {
    isRecording,
    startRecording,
    stopRecording,
    error
  }
}