// src/components/layout/AudioLevelIndicator.tsx
'use client';
import React from 'react';

interface AudioLevelIndicatorProps {
  level: number;
  isRecording: boolean;
}

const AudioLevelIndicator = ({ level = 0, isRecording = false }: AudioLevelIndicatorProps) => {
  // Create 10 segments for the level indicator
  const segments = 10;
  const segmentLevel = Math.floor((level / 60) * segments);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full transition-colors ${
          isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
        }`} />
        <span className="text-xs text-gray-500">
          {isRecording ? 'Recording' : 'Ready'}
        </span>
      </div>
      
      <div className="flex gap-0.5 h-4">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all ${
              i < segmentLevel
                ? i < segments * 0.6
                  ? 'bg-green-500'
                  : i < segments * 0.8
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioLevelIndicator;