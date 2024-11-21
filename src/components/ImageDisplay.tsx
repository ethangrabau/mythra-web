// src/components/ImageDisplay.tsx
'use client';

import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, Minimize } from 'lucide-react';
import { useImageNavigation } from '@/lib/hooks/useImageNavigation';

interface ImageDisplayProps {
  sessionId: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isRecording?: boolean;
}

export default function ImageDisplay({ 
  sessionId, 
  isFullscreen = false,
  onToggleFullscreen,
  isRecording = false
}: ImageDisplayProps) {
  const {
    currentImage,
    hasNextImage,
    hasPreviousImage,
    goToNextImage,
    goToPreviousImage,
    loading,
    totalImages,
    currentImageIndex
  } = useImageNavigation(sessionId);

  // Debug logging
 // console.log('Image Display State:', {
 //   hasNextImage,
 //   hasPreviousImage,
 //   totalImages,
//  currentImageIndex,
 //   currentImage
 // });

  if (!currentImage) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-900 m-4 rounded-lg">
        <div className={`text-white ${loading ? 'animate-pulse' : ''}`}>
          {loading ? 'Generating scene...' : 'No images available'}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full p-4">
      <div className="relative h-full w-full bg-gray-900 rounded-lg overflow-hidden">
        {/* Navigation controls - only hide during recording */}
        {!isRecording && (
          <>
            <button
              onClick={goToPreviousImage}
              className={`absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-10
                ${hasPreviousImage 
                  ? 'bg-black/20 hover:bg-black/30 text-white cursor-pointer' 
                  : 'bg-black/10 text-gray-400 cursor-not-allowed'}`}
              disabled={!hasPreviousImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goToNextImage}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all z-10
                ${hasNextImage 
                  ? 'bg-black/20 hover:bg-black/30 text-white cursor-pointer' 
                  : 'bg-black/10 text-gray-400 cursor-not-allowed'}`}
              disabled={!hasNextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Fullscreen toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/30 text-white transition-all z-10"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Expand className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Image */}
        <div className={`relative w-full h-full transition-all duration-300 ${
          isFullscreen ? "scale-100" : "scale-95"
        }`}>
          <Image
            src={`http://localhost:3001${currentImage}`}
            alt="Generated scene"
            fill
            className="object-contain p-4"
            priority
            onError={(e) => {
              console.error('Error loading image:', e);
            }}
          />
        </div>

        {/* Image count indicator - always show when multiple images exist */}
        {totalImages > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/20 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {totalImages}
          </div>
        )}
      </div>
    </div>
  );
}