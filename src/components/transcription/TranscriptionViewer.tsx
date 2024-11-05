'use client';

import React, { useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import type { TranscriptionData } from '@/lib/types/audio';

interface TranscriptionViewerProps {
  transcriptions: TranscriptionData[];  // Changed to an array
  isRecording: boolean;
}

export default function TranscriptionViewer({ transcriptions, isRecording }: TranscriptionViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (viewerRef.current && isRecording) {
      viewerRef.current.scrollTop = viewerRef.current.scrollHeight;
    }
  }, [transcriptions, isRecording]);

  if (transcriptions.length === 0) {
    return (
      <div className="rounded-lg border bg-gray-50 p-8 text-center text-gray-500">
        {isRecording ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <p>Waiting for transcription...</p>
          </div>
        ) : (
          <p>No transcription available</p>
        )}
      </div>
    );
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    });
  };

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Transcription</h3>
        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Recording
          </div>
        )}
      </div>

      {/* Content */}
      <div 
        ref={viewerRef}
        className="max-h-[500px] overflow-y-auto p-4 space-y-4"
      >
        {transcriptions.map((transcription, index) => (
          <div key={index} className="flex gap-3 group">
            <div className="flex-shrink-0 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-1">
                {formatTimestamp(transcription.timestamp)}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">
                {transcription.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
