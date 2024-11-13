// src/lib/hooks/useImageNavigation.ts
'use client';

import { useState, useEffect } from 'react';

interface ImageNavigationState {
  currentImageIndex: number;
  totalImages: number;
  images: string[];
}

interface ImageApiResponse {
  images?: string[];
  imagePath?: string;
  error?: string;
}

export interface UseImageNavigation {
  currentImage: string | null;
  currentImageIndex: number;
  totalImages: number;
  hasNextImage: boolean;
  hasPreviousImage: boolean;
  goToNextImage: () => void;
  goToPreviousImage: () => void;
  loading: boolean;
}

function normalizeSessionId(sessionId: string): string {
  return sessionId.split('-').slice(0, 2).join('-');
}

export function useImageNavigation(sessionId: string): UseImageNavigation {
  const [state, setState] = useState<ImageNavigationState>({
    currentImageIndex: 0,
    totalImages: 0,
    images: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const fetchImages = async () => {
      try {
        setLoading(true);
        const normalizedId = normalizeSessionId(sessionId);
        
        // Fetch all images first
        const response = await fetch(`http://localhost:3001/api/images`);
        
        if (response.ok) {
          const data = await response.json() as ImageApiResponse;
          if (Array.isArray(data.images)) {
            // Filter images that belong to this session
            const sessionImages = data.images.filter(imagePath => 
              imagePath.includes(normalizedId)
            );

            if (sessionImages.length > 0) {
              console.log('Found images for session:', sessionImages);
              setState({
                images: sessionImages,
                totalImages: sessionImages.length,
                currentImageIndex: sessionImages.length - 1 // Show most recent by default
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    const interval = setInterval(fetchImages, 3000);
    return () => clearInterval(interval);
  }, [sessionId]);

  const goToNextImage = () => {
    setState(prev => ({
      ...prev,
      currentImageIndex: Math.min(prev.currentImageIndex + 1, prev.totalImages - 1)
    }));
  };

  const goToPreviousImage = () => {
    setState(prev => ({
      ...prev,
      currentImageIndex: Math.max(prev.currentImageIndex - 1, 0)
    }));
  };

  const hasNextImage = state.currentImageIndex < state.totalImages - 1;
  const hasPreviousImage = state.currentImageIndex > 0;

  return {
    currentImage: state.images[state.currentImageIndex] || null,
    currentImageIndex: state.currentImageIndex,
    totalImages: state.totalImages,
    hasNextImage,
    hasPreviousImage,
    goToNextImage,
    goToPreviousImage,
    loading
  };
}