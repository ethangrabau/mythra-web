'use client';

import { useRouter } from 'next/navigation';
import { PlayCircle, Images } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';

export default function Home() {
  const router = useRouter();
  const { startSession } = useAudioRecorder();

  const handleStartSession = async () => {
    try {
      const sessionId = await startSession();
      // Navigate to session page with the session ID
      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error('Failed to start session:', err);
      // Optionally show error to user
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to Mythra</h2>
          <p className="text-gray-600 mt-2">Start a new session or view past recordings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={handleStartSession}  // Updated this line
            className="p-8 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-left group"
          >
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-800">Start New Session</h3>
            </div>
            <p className="text-sm text-gray-600">Begin recording a new D&D session with AI-powered visualizations.</p>
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