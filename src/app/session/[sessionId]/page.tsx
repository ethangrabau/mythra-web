//src/app/session/%5BsessionId%5D/page.tsx
'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useEffect, useState } from 'react';
import TranscriptionViewer from '@/components/transcription/TranscriptionViewer';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, Loader2 } from 'lucide-react';

export default function SessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [isInitializing, setIsInitializing] = useState(true);

  const { 
    isRecording, 
    startRecording, 
    stopRecording,
    endSession,
    error,
    isConnected,
    sessionActive,
    startSession,
    transcriptions,  // Add this
  } = useAudioRecorder();

  useEffect(() => {
    const initSession = async () => {
      if (!sessionActive && !isRecording) {
        try {
          if (!isConnected) {
            console.log('Waiting for connection...');
            return;
          }
          
          // Use the sessionId from the URL
          await startSession(sessionId);
          setIsInitializing(false);
        } catch (err) {
          console.error('Failed to initialize session:', err);
          router.push('/');
        }
      } else {
        setIsInitializing(false);
      }
    };
  
    initSession();
  }, [sessionActive, isRecording, isConnected, startSession, router, sessionId]);

  const handleEndSession = async () => {
    if (isRecording) {
      await stopRecording();
    }
    await endSession();
    router.push('/');
  };

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Initializing session...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Session: {sessionId}
            </h1>
            <p className="text-gray-600 mt-1">
              {isRecording ? 'Recording in progress' : 'Session in progress'}
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-4">
            <Button
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              icon={isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>

            <Button
              variant="danger"
              onClick={handleEndSession}
              icon={<X className="w-4 h-4" />}
            >
              End Session
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Connection Status */}
        {!isConnected && (
          <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting to server...
          </div>
        )}

        {/* Transcription Viewer */}
        {/* Transcription Viewer */}
        <TranscriptionViewer
        transcriptions={transcriptions}  // Now using the state we created
        isRecording={isRecording}
        sessionActive={sessionActive}
        sessionId={sessionId}
        />
      </div>
    </main>
  );
}