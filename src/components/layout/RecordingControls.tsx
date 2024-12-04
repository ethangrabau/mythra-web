// src/components/layout/RecordingControls.tsx
'use client';
import React from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import AudioLevelIndicator from './AudioLevelIndicator';

const RecordingControls = () => {
  const { isRecording, startRecording, stopRecording, error, audioLevel, isConnected, sessionData } =
    useAudioRecorder();

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-medium'>Recording Controls</h3>
        <div className='flex items-center gap-2'>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className='text-sm text-muted-foreground'>{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      {/* Session Status */}
      {sessionData && (
        <div className='space-y-2 text-sm text-muted-foreground'>
          <div className='flex justify-between'>
            <span>Duration:</span>
            <span>{formatDuration(sessionData.totalDuration)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Size:</span>
            <span>{formatFileSize(sessionData.totalSize)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Status:</span>
            <span className='capitalize'>{sessionData.status}</span>
          </div>
        </div>
      )}

      {/* Audio Level Indicator */}
      <div className='space-y-2'>
        <AudioLevelIndicator level={audioLevel} isRecording={isRecording} />
      </div>

      {/* Error Display */}
      {error && (
        <div className='flex items-center gap-2 p-2 text-sm text-red-600 bg-red-50 rounded-md'>
          <AlertCircle className='w-4 h-4' />
          <p>{error}</p>
        </div>
      )}

      {/* Recording Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!isConnected}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-2 
          text-sm font-medium text-white rounded-md transition-all
          ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          ${!isConnected && 'opacity-50 cursor-not-allowed'}
        `}>
        <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default RecordingControls;
