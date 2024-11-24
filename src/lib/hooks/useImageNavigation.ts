'use client';

import { useState, useEffect } from 'react';
import { normalizeSessionId } from '../utils/session';

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

export function useImageNavigation(sessionId: string): UseImageNavigation {
  const [state, setState] = useState<ImageNavigationState>({
    currentImageIndex: 0,
    totalImages: 0,
    images: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      console.log('No session ID provided');
      return;
    }

    const fetchImages = async () => {
      try {
        setLoading(true);
        const normalizedId = normalizeSessionId(sessionId);
        console.log('Fetching images for session:', {
          original: sessionId,
          normalized: normalizedId
        });
        
        // First try to get the latest image
        const latestResponse = await fetch(`http://localhost:3001/api/images/latest/${sessionId}`);
        console.log('Latest image response:', {
          status: latestResponse.status,
          ok: latestResponse.ok
        });
        
        if (latestResponse.ok) {
          const latestData = await latestResponse.json() as ImageApiResponse;
          console.log('Latest image data:', latestData);
          
          if (latestData.imagePath) {
            console.log('Updating state with latest image:', {
              imagePath: latestData.imagePath
            });
            
            setState(prev => {
              // If we already have images, check if we need to add the new one
              if (prev.images.length > 0) {
                if (!prev.images.includes(latestData.imagePath!)) {
                  const newImages = [...prev.images, latestData.imagePath!];
                  return {
                    images: newImages,
                    totalImages: newImages.length,
                    currentImageIndex: newImages.length - 1
                  };
                }
                return prev;
              }
              // First image
              return {
                images: [latestData.imagePath!],
                totalImages: 1,
                currentImageIndex: 0
              };
            });
          }
        } else {
          console.log('Latest image fetch failed, attempting to fetch all images...');
          const allResponse = await fetch('http://localhost:3001/api/images');
          
          if (allResponse.ok) {
            const data = await allResponse.json() as ImageApiResponse;
            if (data.images && data.images.length > 0) {
              const sessionImages = data.images
                .filter(img => img.includes(normalizedId))
                .sort((a, b) => {
                  const getTimestamp = (filename: string) => {
                    const match = filename.match(/-(\d+)\.png$/);
                    return match ? parseInt(match[1]) : 0;
                  };
                  return getTimestamp(a) - getTimestamp(b);
                });

              if (sessionImages.length > 0) {
                setState({
                  images: sessionImages,
                  totalImages: sessionImages.length,
                  currentImageIndex: sessionImages.length - 1
                });
              }
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
      currentImageIndex: Math.min(prev.currentImageIndex + 1, prev.images.length - 1)
    }));
  };

  const goToPreviousImage = () => {
    setState(prev => ({
      ...prev,
      currentImageIndex: Math.max(prev.currentImageIndex - 1, 0)
    }));
  };

  const hasNextImage = state.images.length > 1 && state.currentImageIndex < state.images.length - 1;
  const hasPreviousImage = state.images.length > 1 && state.currentImageIndex > 0;

  return {
    currentImage: state.images[state.currentImageIndex] || null,
    currentImageIndex: state.currentImageIndex,
    totalImages: state.images.length,
    hasNextImage,
    hasPreviousImage,
    goToNextImage,
    goToPreviousImage,
    loading
  };
}