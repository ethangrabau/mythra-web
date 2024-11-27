// src/components/layout/Footer.tsx
'use client';
import { usePathname } from 'next/navigation';
import { Wifi, WifiOff, Mic} from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';

export default function Footer() {
  const pathname = usePathname();
  const { 
    isConnected,
    isRecording,
    sessionData
  } = useAudioRecorder();

  const formatDuration = (ms: number) => {
    if (!ms) return '00:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const showSessionInfo = pathname === '/session';

  return (
    <footer className="border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm">
      <div className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-amber-400">Connecting...</span>
              </>
            )}
          </div>

          {/* Recording Status - Only show on session page */}
          {showSessionInfo && sessionData?.status && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-px h-4 bg-gray-700" /> {/* Divider */}
              <Mic className={`w-4 h-4 ${isRecording ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
              <span className="capitalize text-gray-300">{sessionData.status}</span>
              {isRecording && sessionData.totalDuration > 0 && (
                <span className="text-gray-300">{formatDuration(sessionData.totalDuration)}</span>
              )}
            </div>
          )}

          {/* Show session ID if available */}
          {showSessionInfo && sessionData?.sessionId && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-px h-4 bg-gray-700" /> {/* Divider */}
              <span className="text-gray-400">Session: {sessionData.sessionId}</span>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500">
          Mythra v0.1
        </div>
      </div>
    </footer>
  );
}