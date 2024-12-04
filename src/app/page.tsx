'use client';

import React from 'react';
import { PlayCircle, StopCircle, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import TranscriptionViewer from '@/components/transcription/TranscriptionViewer';

export default function Home() {
  const {
    isRecording,
    startRecording,
    stopRecording,
    transcriptions,
    sessionActive,
    sessionId,
    error,
    audioLevel,
    endSession,
  } = useAudioRecorder();

  return (
    <main className='flex-1 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header section unchanged */}

        {/* Main Content */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {/* Transcription Viewer */}
          <div className='md:col-span-4'>
            <TranscriptionViewer
              transcriptions={(() => {
                console.log('Transcriptions passed to viewer:', transcriptions);
                return transcriptions ?? [];
              })()}
              isRecording={isRecording}
              sessionActive={sessionActive ?? false}
              sessionId={sessionId ?? ''}
            />
          </div>

          {/* Recording Controls */}
          <div className='md:col-span-4 flex justify-center space-x-4'>
            {sessionActive ? (
              isRecording ? (
                <Button variant='danger' onClick={stopRecording} icon={<StopCircle className='w-6 h-6' />}>
                  Stop Recording
                </Button>
              ) : (
                <Button variant='primary' onClick={startRecording} icon={<PlayCircle className='w-6 h-6' />}>
                  Start Recording
                </Button>
              )
            ) : (
              <Button variant='primary' onClick={startRecording} icon={<Mic className='w-6 h-6' />}>
                Start Session
              </Button>
            )}

            {sessionActive && (
              <Button variant='secondary' onClick={endSession} icon={<StopCircle className='w-6 h-6' />}>
                End Session
              </Button>
            )}
          </div>

          {/* Display any error messages */}
          {error && <div className='md:col-span-4 text-center text-red-500'>{error}</div>}
        </div>
      </div>
    </main>
  );
}
