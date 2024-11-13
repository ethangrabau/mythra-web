// src/lib/hooks/useImageNavigation.ts
'use client';

import { useState, useEffect } from 'react';
import { normalizeSessionId } from '../utils/session';  // Add this import


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

// src/lib/hooks/useImageNavigation.ts
  
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
          console.log('Normalized session ID:', {
            original: sessionId,
            normalized: normalizedId,
            timestamp: Date.now()
          });
          
          // First try to get the latest image
          const latestResponse = await fetch(`http://localhost:3001/api/images/latest/${sessionId}`);
          console.log('Latest image response:', latestResponse.status);
          
          if (latestResponse.ok) {
            const latestData = await latestResponse.json() as ImageApiResponse;
            if (latestData.imagePath) {
              console.log('Found latest image:', latestData.imagePath);
              setState({
                images: [latestData.imagePath],
                totalImages: 1,
                currentImageIndex: 0
              });
            }
          } else {
            // Try to find images by checking all images
            const allResponse = await fetch('http://localhost:3001/api/images');
            if (allResponse.ok) {
              const data = await allResponse.json() as ImageApiResponse;
              if (data.images) {
                // Find images that match the normalized session ID
                const normalizedPattern = normalizedId.replace(/session-/, '');
                const matchingImages = data.images.filter(img => 
                  img.includes(normalizedPattern)
                );
                
                console.log('Image matching:', {
                  pattern: normalizedPattern,
                  found: matchingImages.length,
                  matches: matchingImages
                });
  
                if (matchingImages.length > 0) {
                  setState({
                    images: matchingImages,
                    totalImages: matchingImages.length,
                    currentImageIndex: matchingImages.length - 1
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