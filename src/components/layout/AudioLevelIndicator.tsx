import React from 'react';

const AudioLevelIndicator = ({ level = 0, isRecording = false }) => {
  // Scale from 0-60 to 0-100
  const percentage = Math.min((level / 60) * 100, 100);
  
  // Get color based on percentage
  const getColor = (pct: number) => {
    if (pct < 33) return 'bg-blue-500';
    if (pct < 66) return 'bg-green-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Recording status indicator */}
      <div 
        className={`w-3 h-3 rounded-full ${
          isRecording 
            ? 'bg-red-500 animate-pulse' 
            : 'bg-gray-300'
        }`}
      />
      
      {/* Level meter background */}
      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
        {/* Active level indicator */}
        <div 
          className={`h-full transition-all duration-100 ${getColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AudioLevelIndicator;