'use client';

import React, { useEffect, useRef } from 'react';
import { Clock, Mic } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { TranscriptionData } from '@/lib/types/audio';

interface TranscriptionViewerProps {
  transcriptions: TranscriptionData[];
  isRecording: boolean;
  sessionActive: boolean;
  sessionId?: string;
}

const TranscriptionViewer = ({ transcriptions, isRecording, sessionActive, sessionId }: TranscriptionViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    if (viewerRef.current && isRecording) {
      viewerRef.current.scrollTop = viewerRef.current.scrollHeight;
    }
  }, [transcriptions, isRecording]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!sessionActive) {
    return (
      <Card className='min-h-[400px] flex items-center justify-center text-gray-500'>
        <p>Start a new session to begin recording</p>
      </Card>
    );
  }

  return (
    <Card className='min-h-[400px] flex flex-col'>
      {/* Header */}
      <div className='border-b px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <h3 className='font-medium text-gray-900'>Session Transcript</h3>
          {sessionId && <span className='text-xs text-gray-500'>({sessionId})</span>}
        </div>
        {isRecording && (
          <div className='flex items-center gap-2 text-sm text-red-600'>
            <div className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
            Recording
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={viewerRef} className='flex-1 overflow-y-auto p-4 space-y-4'>
        {!transcriptions || transcriptions.length === 0 ? (
          <div className='h-full flex items-center justify-center text-gray-500'>
            {isRecording ? (
              <div className='flex items-center gap-2'>
                <Mic className='w-4 h-4 animate-pulse' />
                <p>Listening...</p>
              </div>
            ) : (
              <p>No transcriptions yet</p>
            )}
          </div>
        ) : (
          transcriptions.map((transcription, index) => (
            <div key={index} className='flex gap-3 group'>
              <div className='flex-shrink-0 text-sm text-gray-500'>
                <Clock className='w-4 h-4' />
              </div>
              <div className='flex-1'>
                <div className='text-xs text-gray-500 mb-1'>{formatTimestamp(transcription.timestamp)}</div>
                <p className='text-gray-800 whitespace-pre-wrap'>{transcription.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TranscriptionViewer;
