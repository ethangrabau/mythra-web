// src/components/layout/Footer.tsx
'use client';
import { Wifi, WifiOff, Mic} from 'lucide-react';

interface FooterProps {
  isConnected?: boolean;
  sessionStatus?: string;
  recordingDuration?: number;
}

export default function Footer({ isConnected, sessionStatus, recordingDuration }: FooterProps) {
  const formatDuration = (ms: number) => {
    if (!ms) return '00:00';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="border-t bg-white/50 backdrop-blur-sm">
      <div className="px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-green-600">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className="text-yellow-600">Connecting...</span>
              </>
            )}
          </div>

          {/* Recording Status */}
          {sessionStatus && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-px h-4 bg-gray-300" /> {/* Divider */}
              <Mic className={`w-4 h-4 ${sessionStatus === 'recording' ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
              <span className="capitalize text-gray-600">{sessionStatus}</span>
              {recordingDuration && sessionStatus === 'recording' && (
                <span className="text-gray-600">{formatDuration(recordingDuration)}</span>
              )}
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