'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, Minimize } from 'lucide-react';
import { useImageNavigation } from '@/lib/hooks/useImageNavigation';
import { Card } from '@/components/ui/card';

interface ImageDisplayProps {
  sessionId: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isRecording?: boolean;
  onImageChange?: (imageUrl: string | null) => void;
}

export default function ImageDisplay({
  sessionId,
  isFullscreen = false,
  onToggleFullscreen,
  isRecording = false,
  onImageChange
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
  } = useImageNavigation(sessionId, onImageChange);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Only handle keyboard navigation if we're not recording
      if (isRecording) return;

      switch (event.key) {
        case 'ArrowLeft':
          if (hasPreviousImage) {
            goToPreviousImage();
          }
          break;
        case 'ArrowRight':
          if (hasNextImage) {
            goToNextImage();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [goToNextImage, goToPreviousImage, hasNextImage, hasPreviousImage, isRecording]);

  if (!currentImage) {
    return (
      <Card className="w-full min-h-[400px] flex items-center justify-center">
        <div className={`text-gray-500 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? 'Generating scene...' : 'No images available'}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
      <div className="relative h-full w-full bg-gray-900 rounded-lg overflow-hidden">
        {/* Navigation controls - only hide during recording */}
        {!isRecording && (
          <>
            <button
              onClick={goToPreviousImage}
              className="nav-button left-4"
              disabled={!hasPreviousImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={goToNextImage}
              className="nav-button right-4"
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
            className="fullscreen-button"
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

        {/* Image count indicator */}
        {totalImages > 1 && (
          <div className="image-counter">
            {currentImageIndex + 1} / {totalImages}
          </div>
        )}
      </div>
    </Card>
  );
}