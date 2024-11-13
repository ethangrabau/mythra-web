'use client';

import { PlayCircle, StopCircle } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TranscriptionViewer from '@/components/transcription/TranscriptionViewer';
import ImageDisplay from '@/components/ImageDisplay';
import { cn } from '@/lib/utils/ui';

const SessionPage = () => {
  const params = useParams();
  const sessionIdFromUrl = params?.sessionId as string;
  
  const {
    isRecording,
    startRecording,
    stopRecording,
    sessionData,
    transcriptions,
    isConnected,
    error: hookError,
    startSession // Add this
  } = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Connect to existing session when component mounts
  useEffect(() => {
    if (sessionIdFromUrl && !sessionData) {
      console.log('Connecting to existing session:', sessionIdFromUrl);
      startSession(sessionIdFromUrl).catch(err => {
        console.error('Error connecting to session:', err);
        setError('Failed to connect to session');
      });
    }
  }, [sessionIdFromUrl, sessionData, startSession]);

  const handleStartRecording = async () => {
    try {
      setError(null);
      await startRecording();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const handleStopRecording = () => {
    try {
      stopRecording();
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
    }
  };

  // Add debug logging
  useEffect(() => {
    console.log('Session state:', {
      urlSessionId: sessionIdFromUrl,
      hookSessionId: sessionData?.sessionId,
      isRecording,
      isConnected
    });
  }, [sessionIdFromUrl, sessionData?.sessionId, isRecording, isConnected]);

  return (
    <main className="h-screen w-full bg-gray-50 overflow-hidden">
      {/* Error display */}
      {(error || hookError) && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-red-50 p-4 text-red-700 text-sm">
          {error || hookError}
        </div>
      )}

      {/* Main content */}
      <div className="flex h-full">
        {/* Transcript panel */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isFullscreen ? "w-0 opacity-0" : "w-1/3 opacity-100"
        )}>
          <div className="h-full overflow-auto">
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Session Recording</h2>
                <p className="text-gray-600 mt-2">
                  Control and manage your D&D session recordings.
                </p>
              </div>

              {/* Recording controls */}
              <div>
                {!isRecording ? (
                  <button
                    onClick={handleStartRecording}
                    disabled={!isConnected}
                    className="p-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
                  >
                    <PlayCircle className="w-6 h-6 inline-block mr-2" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={handleStopRecording}
                    className="p-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
                  >
                    <StopCircle className="w-6 h-6 inline-block mr-2" />
                    Stop Recording
                  </button>
                )}
              </div>

              {/* Transcription viewer */}
              <TranscriptionViewer
                sessionId={sessionData?.sessionId || ''}
                isRecording={isRecording}
                sessionActive={!!sessionData}
                transcriptions={transcriptions}
              />
            </div>
          </div>
        </div>

        {/* Image display */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isFullscreen ? "w-full" : "w-2/3"
        )}>
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