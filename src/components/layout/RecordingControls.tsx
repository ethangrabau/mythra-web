// RecordingControls.tsx
import React from 'react';
import { Mic } from 'lucide-react';
import { useAudioRecorder } from '@/lib/hooks/useAudioRecorder';
import AudioLevelIndicator from './AudioLevelIndicator';

const RecordingControls = () => {
  const { isRecording, startRecording, stopRecording, error, audioLevel } = useAudioRecorder();

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Recording Status</h3>

      {/* Audio Level Indicator */}
      <div className="space-y-2">
        <AudioLevelIndicator 
          level={audioLevel} 
          isRecording={isRecording} 
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-3">{error}</p>
      )}

      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors
          ${isRecording 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-green-600 hover:bg-green-700'
          }`}
      >
        <Mic className={`w-4 h-4 group-hover:scale-110 transition-transform ${isRecording ? 'animate-pulse' : ''}`} />
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default RecordingControls;