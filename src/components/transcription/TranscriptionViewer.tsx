// TranscriptionViewer.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';
import { Card } from "@/components/ui/card";
import type { TranscriptionData } from '@/lib/types/audio';

interface TranscriptionViewerProps {
  sessionId: string;
  isRecording: boolean;
  sessionActive: boolean;
}

export default function TranscriptionViewer({ 
  sessionId,
  isRecording, 
  sessionActive 
}: TranscriptionViewerProps) {
  const [transcriptions, setTranscriptions] = useState<TranscriptionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Set up WebSocket connection for real-time updates
  useEffect(() => {
    if (!sessionId || !sessionActive) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/transcription`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'transcription' && data.sessionId === sessionId) {
        setTranscriptions(prev => [...prev, data.payload]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to transcription service');
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [sessionId, sessionActive]);

  // Initial fetch of existing transcriptions
  useEffect(() => {
    const fetchTranscriptions = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        return;
      }

      try {
        const response = await fetch(`/api/transcription/${sessionId}`);
        if (!response.ok) throw new Error('Failed to fetch transcriptions');
        
        const data = await response.json();
        if (Array.isArray(data)) {
          setTranscriptions(data);
        }
      } catch (err) {
        console.error('Error fetching transcriptions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch transcriptions');
      }
    };

    fetchTranscriptions();
  }, [sessionId]);

  // Auto-scroll to latest transcription
  useEffect(() => {
    if (viewerRef.current && isRecording && sessionActive) {
      viewerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcriptions, isRecording, sessionActive]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  if (error) {
    return (
      <Card>
        <div className="rounded-lg bg-gray-50 p-8 text-center text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Session Transcription</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Session: {sessionId}</span>
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Recording
            </div>
          )}
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <div className="p-4 space-y-4">
          {transcriptions.map((transcription, index) => (
            <div 
              key={`${transcription.timestamp}-${index}`}
              className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatTimestamp(transcription.timestamp)}</span>
              </div>
              <p className="flex-1 text-gray-800 whitespace-pre-wrap">
                {transcription.text}
              </p>
            </div>
          ))}
          <div ref={viewerRef} />
        </div>
      </div>
    </Card>
  );
}
