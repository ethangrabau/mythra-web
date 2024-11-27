'use client';

import { PlayCircle, StopCircle, RotateCcw, Printer } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useState, useEffect, useCallback } from 'react';
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
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false); // Add this here
  const [progress, setProgress] = useState(0); // Progress bar state


   // Add the debug useEffect here
   useEffect(() => {
    console.log('Current image URL updated:', currentImageUrl);
  }, [currentImageUrl]);


  const handleRestart = useCallback(async () => {
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
  }, [isRecording, stopRecording, startSession, router]);

  const handlePrint = useCallback(async () => {
    if (!currentImageUrl) {
      console.error('No image available to print');
      return;
    }
  
    setError(null);
    setIsPrinting(true);
    setProgress(0);
  
    const imageName = currentImageUrl.split('/').pop();
  
    // Start the progress bar independently
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 1 : 100));
    }, 600); // Update every 0.6 seconds for 60 seconds (or adjust as needed)
  
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageName }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to start print job');
      }
  
      const result = await response.json();
      console.log('Print job started:', result);
    } catch (error) {
      console.error('Error starting print job:', error);
      setError('Failed to print image. Please try again.');
    } finally {
      clearInterval(progressInterval); // Stop the progress bar updates
      setProgress(100); // Ensure the progress bar completes
      setTimeout(() => setIsPrinting(false), 1000); // Allow the progress bar to complete visually before hiding the overlay
    }
  }, [currentImageUrl]);  

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else if (isConnected) {
      startRecording();
    }
  }, [isRecording, isConnected, startRecording, stopRecording]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case '1': // Toggle recording
          toggleRecording();
          break;
        case '3': // Print the current image
          handlePrint();
          break;
        case '2': // Restart session
          handleRestart();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [toggleRecording, handlePrint, handleRestart]);

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

  return (
    <main className="h-screen w-full bg-gray-50 overflow-hidden">
      {/* Printing in Progress Overlay */}
      {isPrinting && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/75 text-white text-lg">
          <p>Printing in progress. Please wait...</p>
          <div className="w-3/4 mt-4 h-4 bg-gray-600 rounded">
            <div
              className="h-4 bg-green-400 rounded"
              style={{ width: `${progress}%` }} // Dynamic progress bar width
            ></div>
          </div>
        </div>
      )}
  
      {/* Error Message */}
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
            <p className="text-gray-600 mt-2">
              Control and manage your D&D session recordings.
            </p>
  
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleRecording}
                disabled={!isConnected}
                className={cn(
                  'p-4 rounded-lg text-white transition-all',
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                )}
              >
                {isRecording ? (
                  <>
                    <StopCircle className="w-6 h-6 inline-block mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-6 h-6 inline-block mr-2" />
                    Start Recording
                  </>
                )}
              </button>
              <button
                onClick={handleRestart}
                className="p-4 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-all"
              >
                <RotateCcw className="w-6 h-6 inline-block mr-2" />
                Restart Session
              </button>
              <button
                onClick={handlePrint}
                disabled={!currentImageUrl || isPrinting}
                className="p-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-6 h-6 inline-block mr-2" />
                {isPrinting ? 'Printing...' : 'Print Image'}
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
            onImageChange={setCurrentImageUrl}
          />
        </div>
      </div>
    </main>
  );
  
};

export default SessionPage;