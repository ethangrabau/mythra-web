'use client';

import { useRouter } from 'next/navigation';
import { PlayCircle, StopCircle, Images } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useState } from 'react';
import TranscriptionViewer from '@/components/transcription/TranscriptionViewer';
import ImageDisplay from '@/components/ImageDisplay';

const SessionPage = () => {
  const router = useRouter();
  const {
    isRecording,
    startRecording,
    stopRecording,
    sessionData,
    transcriptions,
    isConnected,
    error: hookError,
  } = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);

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

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Session Recording</h2>
          <p className="text-gray-600 mt-2">Control and manage your D&D session recordings.</p>
        </div>

        {(error || hookError) && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm">
            {error || hookError}
          </div>
        )}

        <div className="space-y-4">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              disabled={!isConnected}
              className="p-4 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all"
            >
              <PlayCircle className="w-6 h-6 inline-block" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="p-4 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
            >
              <StopCircle className="w-6 h-6 inline-block" />
              Stop Recording
            </button>
          )}
        </div>

        <TranscriptionViewer
          sessionId={sessionData?.sessionId || ''}
          isRecording={isRecording}
          sessionActive={!!sessionData}
          transcriptions={transcriptions}
        />

        <ImageDisplay sessionId={sessionData?.sessionId || ''} />

        <div>
          <button
            onClick={() => router.push('/recaps')}
            className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Images className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-800">View Recaps</h3>
            </div>
            <p className="text-sm text-gray-600">Browse through past session recaps and generated imagery.</p>
          </button>
        </div>
      </div>
    </main>
  );
};

export default SessionPage;