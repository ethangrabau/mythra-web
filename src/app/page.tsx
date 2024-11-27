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
      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl font-obra text-gray-100">Welcome to Mythra</h2>
          <p className="text-gray-400 mt-2 font-obra">Start a new session or view past recordings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={handleStartSession}
            className="p-8 rounded-xl border border-gray-700 bg-gray-800/50 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02] text-left group backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <PlayCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-obra text-gray-100">Start New Session</h3>
            </div>
            <p className="text-sm text-gray-400 font-obra">Begin recording a new D&D session with AI-powered visualizations.</p>
          </button>

          <button 
            onClick={() => router.push('/recaps')}
            className="p-8 rounded-xl border border-gray-700 bg-gray-800/50 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:bg-gray-800/80 transition-all duration-200 hover:scale-[1.02] text-left group backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <Images className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-obra text-gray-100">View Recaps</h3>
            </div>
            <p className="text-sm text-gray-400 font-obra">Browse through past session recaps and generated imagery.</p>
          </button>
        </div>
      </div>
    </main>
  );
}