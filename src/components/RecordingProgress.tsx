import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const RecordingProgress = () => {
  const [progress, setProgress] = useState(0);
  const chunkDuration = 10000; // 10 seconds in ms

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed % chunkDuration) / chunkDuration * 100;
      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-4 shadow-lg">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-300">
            <span>Recording chunk progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Processing audio in {chunkDuration/1000}-second chunks</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
            <span>Images will appear after recording on the right</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingProgress;