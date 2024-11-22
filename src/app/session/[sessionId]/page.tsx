'use client';

import { PlayCircle, StopCircle, RotateCcw } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TranscriptionViewer from '@/components/transcription/TranscriptionViewer';
import ImageDisplay from '@/components/ImageDisplay';
import { cn } from '@/lib/utils/ui';

const SessionPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionIdFromUrl = params?.sessionId as string;

  const {
    isRecording,
    startRecording,
    stopRecording,
    sessionData,
    transcriptions,
    isConnected,
    error: hookError,
    startSession,
  } = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Add the new useEffect here
  useEffect(() => {
    console.log('Rendering button with isRecording:', isRecording);
  }, [isRecording]);

  useEffect(() => {
    if (sessionIdFromUrl && !sessionData) {
      console.log('Connecting to existing session:', sessionIdFromUrl);
      startSession(sessionIdFromUrl).catch((err) => {
        console.warn('Error connecting to session:', err);

        if (err.message.includes('WebSocket is not connected')) {
          console.warn('Suppressing session connection error');
          return;
        }

        setError('Failed to connect to session');
      });
    }
  }, [sessionIdFromUrl, sessionData, startSession]);

  const handleRestart = async () => {
    try {
      setError(null);

      if (isRecording) {
        stopRecording();
      }

      const response = await fetch('/api/delete-memory-log', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to delete memory log');
      }

      console.log('Memory log deleted successfully.');

      const newSessionId = await startSession();
      if (newSessionId) {
        router.push(`/session/${newSessionId}`);
      }
    } catch (err) {
      console.error('Failed to restart session:', err);
      setError(err instanceof Error ? err.message : 'Failed to restart session');
    }
  };

  return (
    <main className="h-screen w-full bg-gray-50 overflow-hidden">
      {error || hookError ? (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-50 p-4 text-red-700 text-sm">
          {error || hookError}
        </div>
      ) : null}

      <div className="flex h-full">
        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isFullscreen ? 'w-0 opacity-0' : 'w-1/3 opacity-100'
          )}
        >
          <div className="h-full overflow-auto p-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Session Recording</h2>
            <p className="text-gray-600 mt-2">Control and manage your D&D session recordings.</p>

            <div className="flex items-center space-x-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={!isConnected || isRecording}
                  className="p-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
                >
                  <PlayCircle className="w-6 h-6 inline-block mr-2" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="p-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                >
                  <StopCircle className="w-6 h-6 inline-block mr-2" />
                  Stop Recording
                </button>
              )}
              <button
                onClick={handleRestart}
                className="p-4 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-all"
              >
                <RotateCcw className="w-6 h-6 inline-block mr-2" />
                Restart Session
              </button>
            
            </div>

            <TranscriptionViewer
              sessionId={sessionData?.sessionId || ''}
              isRecording={isRecording}
              sessionActive={!!sessionData}
              transcriptions={transcriptions}
            />
          </div>
        </div>

        <div
          className={cn(
            'transition-all duration-300 ease-in-out',
            isFullscreen ? 'w-full' : 'w-2/3'
          )}
        >
          <ImageDisplay
            sessionId={sessionData?.sessionId || ''}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            isRecording={isRecording}
          />
        </div>
      </div>
    </main>
  );
};

export default SessionPage;
