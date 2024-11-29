// src/components/WelcomeOverlay.tsx 
import React from 'react';
import { Card } from '@/components/ui/card';

const WelcomeOverlay = () => {
  const examples = [
    "a castle made of cotton candy",
    "a bunny birthday party",
    "a goblin chases an elf down a dark forest path"
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-50 p-4">
      {/* Update Card styling to use dark theme colors */}
      <Card className="max-w-2xl w-full bg-[#0f1524] border border-[#1a2031]">
        <div className="p-8 space-y-10">
          <h1 className="text-4xl font-obra text-gray-100 text-center mb-8">
            Welcome to Mythra
          </h1>
          
          <div className="space-y-10">
            {/* Start Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-obra font-bold text-[#22c55e]">1.</span>
                <h2 className="text-3xl font-obra font-bold text-gray-100">Start</h2>
              </div>
              <p className="text-gray-400 ml-12 font-obra">
                Press &quot;start/stop&quot; button
              </p>
            </div>

            {/* Speak Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-obra font-bold text-[#3b82f6]">2.</span>
                <h2 className="text-3xl font-obra font-bold text-gray-100">Speak</h2>
              </div>
              <div className="ml-12">
                <p className="text-gray-400 mb-2 font-obra">Example:</p>
                <div className="space-y-2">
                  {examples.map((example, idx) => (
                    <p key={idx} className="text-gray-400 italic font-obra">
                      &quot;{example}&quot;
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Print Section */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-obra font-bold text-[#a855f7]">3.</span>
                <h2 className="text-3xl font-obra font-bold text-gray-100">Print</h2>
              </div>
              <p className="text-gray-400 ml-12 font-obra">
                Press &quot;start/stop&quot; and then &quot;print&quot;
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeOverlay;