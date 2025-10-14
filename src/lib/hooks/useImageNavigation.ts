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

export function useImageNavigation(
  sessionId: string,
  onImageChange?: (imageUrl: string | null) => void
): UseImageNavigation {
  const [state, setState] = useState<ImageNavigationState>({
    currentImageIndex: 0,
    totalImages: 0,
    images: [],
  });
  const [loading, setLoading] = useState(false);

  // Add this effect to call onImageChange whenever the current image changes
  useEffect(() => {
    if (onImageChange) {
      onImageChange(state.images[state.currentImageIndex] || null);
    }
  }, [state.images, state.currentImageIndex, onImageChange]);

  useEffect(() => {
    if (!sessionId) {
      console.log('No session ID provided');
      return;
    }

    const fetchImages = async () => {
      try {
        setLoading(true);
        
        // Try to get all campaign images
        const cacheBuster = `?t=${Date.now()}`;
        const campaignResponse = await fetch(`http://localhost:3002/api/campaign-images/${sessionId}${cacheBuster}`);
        
        if (campaignResponse.ok) {
          const campaignData = await campaignResponse.json() as { images: string[] };
          
          if (campaignData.images && campaignData.images.length > 0) {
            // Sort images by timestamp (newest last)
            const sortedImages = campaignData.images.sort((a, b) => {
              const getTimestamp = (path: string) => {
                const match = path.match(/-(\d+)\.png$/);
                return match ? parseInt(match[1]) : 0;
              };
              return getTimestamp(a) - getTimestamp(b);
            });
            
            // Add cache-busting to all image URLs
            const imagesWithCacheBuster = sortedImages.map(img => `${img}?t=${Date.now()}`);
            
            setState(prev => {
              // Check if there are new images
              const hasNewImages = imagesWithCacheBuster.length > prev.images.length;
              
              if (hasNewImages) {
                console.log('New images detected! Jumping to latest image');
                // Jump to the newest image when new images are added
                return {
                  images: imagesWithCacheBuster,
                  totalImages: imagesWithCacheBuster.length,
                  currentImageIndex: imagesWithCacheBuster.length - 1  // Show newest image
                };
              } else if (imagesWithCacheBuster.length !== prev.images.length) {
                // Images changed but not new ones (maybe some were deleted)
                return {
                  images: imagesWithCacheBuster,
                  totalImages: imagesWithCacheBuster.length,
                  currentImageIndex: Math.min(prev.currentImageIndex, imagesWithCacheBuster.length - 1)
                };
              }
              return prev;
            });
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
    const interval = setInterval(fetchImages, 2000); // Reduced from 3000ms to 2000ms for faster updates
    return () => clearInterval(interval);
  }, [sessionId]);

  const goToNextImage = () => {
    console.log('goToNextImage called. Current state:', {
      currentIndex: state.currentImageIndex,
      totalImages: state.images.length,
      hasNext: state.currentImageIndex < state.images.length - 1
    });
    setState(prev => {
      const newIndex = Math.min(prev.currentImageIndex + 1, prev.images.length - 1);
      console.log('Setting new image index:', newIndex, 'of', prev.images.length);
      return {
        ...prev,
        currentImageIndex: newIndex
      };
    });
  };
  
  const goToPreviousImage = () => {
    console.log('goToPreviousImage called. Current state:', {
      currentIndex: state.currentImageIndex,
      totalImages: state.images.length,
      hasPrev: state.currentImageIndex > 0
    });
    setState(prev => {
      const newIndex = Math.max(prev.currentImageIndex - 1, 0);
      console.log('Setting new image index:', newIndex, 'of', prev.images.length);
      return {
        ...prev,
        currentImageIndex: newIndex
      };
    });
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