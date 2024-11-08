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
  const viewerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest transcription
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.scrollIntoView({ behavior: 'smooth' });
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

  const latestTranscription = transcriptions[transcriptions.length - 1];

  if (!latestTranscription) {
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

      <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
        <div 
          key={`${latestTranscription.timestamp}`}
          className="flex gap-3 group hover:bg-gray-50 p-2 rounded-lg"
          ref={viewerRef}
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{formatTimestamp(latestTranscription.timestamp)}</span>
          </div>
          <p className="flex-1 text-gray-800 whitespace-pre-wrap">
            {latestTranscription.text}
          </p>
        </div>
      </div>
    </Card>
  );
}
