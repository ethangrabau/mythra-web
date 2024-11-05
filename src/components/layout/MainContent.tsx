'use client';

import { ReactNode } from 'react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import TranscriptionViewer from '@/components/transcription/TranscriptionViewer';

interface MainContentProps {
  children: ReactNode;
}

export default function MainContent({ children }: MainContentProps) {
  const { isRecording, sessionData } = useAudioRecorder();
  
  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {children}
        
        {/* Show transcription viewer when recording is active or transcription exists */}
        {(isRecording || sessionData?.transcription) && (
          <TranscriptionViewer 
            transcription={sessionData?.transcription}
            isRecording={isRecording}
          />
        )}
      </div>
    </main>
  );
}