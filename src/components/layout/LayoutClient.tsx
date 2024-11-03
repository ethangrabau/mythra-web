// src/components/layout/LayoutClient.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import type { ReactNode } from 'react';

interface LayoutClientProps {
  children: ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    isConnected,
    sessionData
  } = useAudioRecorder();

  return (
    <div className="flex flex-col h-screen">
      <Header 
        isRecording={isRecording}
        onNewSession={startRecording}
        onStopRecording={stopRecording}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          {children}
          <Footer 
            isConnected={isConnected}
            sessionStatus={sessionData?.status}
            recordingDuration={sessionData?.totalDuration}
          />
        </div>
      </div>
    </div>
  );
}