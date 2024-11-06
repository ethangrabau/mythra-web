'use client';

import { useRouter } from 'next/navigation';
import { PlayCircle, Images, Loader2 } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { startSession, isConnected, error: hookError } = useAudioRecorder();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isConnected) {
        throw new Error('Please wait for connection to be established');
      }
      
      const sessionId = await startSession();
      // Wait for session to be established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (sessionId) {
        router.push(`/session/${sessionId}`);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Mythra</h2>
          <p className="text-gray-600 mt-2">Start a new session or view past recordings.</p>
        </div>

        {(error || hookError) && (
          <div className="rounded-lg bg-red-50 p-4 text-red-700 text-sm">
            {error || hookError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={handleStartSession}
            disabled={isLoading || !isConnected}
            className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group relative"
          >
            <div className="flex items-center gap-3 mb-2">
              {isLoading ? (
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <PlayCircle className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {isLoading ? 'Starting Session...' : 'Start New Session'}
              </h3>
            </div>
            <p className="text-sm text-gray-600">Begin recording a new D&D session with AI-powered visualizations.</p>
            {!isConnected && (
              <div className="absolute inset-0 bg-gray-50/50 flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting to server...
                </div>
              </div>
            )}
          </button>

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
}