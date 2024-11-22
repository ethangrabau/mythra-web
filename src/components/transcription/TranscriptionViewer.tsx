'use client';

import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import { Card } from "@/components/ui/card";
import type { TranscriptionData } from '@/lib/types/audio';

interface TranscriptionViewerProps {
  sessionId: string;
  isRecording: boolean;
  sessionActive: boolean;
  transcriptions: TranscriptionData[];
}

export default function TranscriptionViewer({ 
  sessionId,
  isRecording, 
  transcriptions 
}: TranscriptionViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Debug log for initial render
  console.log('TranscriptionViewer: Render with props:', {
    sessionId,
    isRecording,
    transcriptionCount: transcriptions?.length || 0,
    transcriptions
  });

  // Auto-scroll to the latest transcription when updated
  useEffect(() => {
    console.log('TranscriptionViewer: Running auto-scroll effect for transcriptions.');
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  if (!transcriptions?.length) {
    console.log('TranscriptionViewer: No transcriptions to display. Showing placeholder UI.');
    return (
      <Card>
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
          {isRecording ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p>Waiting for transcription...</p>
            </div>
          ) : (
            <p>No transcriptions available</p>
          )}
        </div>
      </Card>
    );
  }

  console.log('TranscriptionViewer: Rendering transcriptions:', transcriptions);

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

      <div 
        ref={containerRef} 
        className="max-h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
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
      </div>
    </Card>
  );
}
