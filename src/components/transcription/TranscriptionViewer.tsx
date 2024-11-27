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
  sessionActive,
  transcriptions 
}: TranscriptionViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced debug effect to track all state changes
  useEffect(() => {
    console.log('TranscriptionViewer: State Update:', {
      sessionId,
      isRecording,
      sessionActive,
      transcriptionsLength: transcriptions?.length,
      transcriptions: transcriptions || [],
      isArrayValid: Array.isArray(transcriptions),
      transcriptionTexts: transcriptions?.map(t => t.text),
      hasContainer: !!containerRef.current
    });
  }, [sessionId, isRecording, sessionActive, transcriptions]);

  // Auto-scroll effect with debug
  useEffect(() => {
    console.log('TranscriptionViewer: Auto-scroll effect triggered', {
      hasTranscriptions: !!transcriptions?.length,
      containerExists: !!containerRef.current,
      currentScroll: containerRef.current?.scrollTop,
      scrollHeight: containerRef.current?.scrollHeight
    });

    if (containerRef.current && transcriptions?.length > 0) {
      const scrollTarget = containerRef.current.scrollHeight;
      containerRef.current.scrollTop = scrollTarget;
      
      console.log('TranscriptionViewer: Scrolled to:', {
        target: scrollTarget,
        actual: containerRef.current.scrollTop
      });
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
    return (
      <Card className="bg-gray-900 border-gray-700">
        <div className="rounded-lg bg-gray-900 p-8 text-center text-gray-400">
          {isRecording ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <p>Waiting for transcription...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p>No transcriptions available</p>
              <div className="text-sm text-gray-500">Session: {sessionId}</div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <div className="border-b border-gray-700 px-4 py-3 flex items-center justify-between bg-gray-900">
        <h3 className="font-medium text-gray-200">Session Transcription</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Session: {sessionId}</span>
          {isRecording && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Recording
            </div>
          )}
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="max-h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-900"
      >
        {transcriptions.map((transcription, index) => (
          <div 
            key={`${transcription.timestamp}-${index}`}
            className="flex gap-3 group hover:bg-gray-800 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{formatTimestamp(transcription.timestamp)}</span>
            </div>
            <p className="flex-1 text-gray-300 whitespace-pre-wrap">
              {transcription.text}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}