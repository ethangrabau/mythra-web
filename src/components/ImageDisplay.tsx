'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImageDisplayProps {
  sessionId: string;
}

export default function ImageDisplay({ sessionId }: ImageDisplayProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
  
    const checkForNewImage = async () => {
      try {
        setLoading(true);
        const normalizedSessionId = sessionId.replace(/-[^-]+$/, '');
        const response = await fetch(`http://localhost:3001/api/images/latest/${normalizedSessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.imagePath && data.imagePath !== currentImage) {
            console.log('Found new image:', data.imagePath);
            setCurrentImage(data.imagePath);
          }
        } else {
          console.log('No images available yet');
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        setLoading(false);
      }
    };
  
    checkForNewImage();
    const interval = setInterval(checkForNewImage, 3000);
  
    return () => clearInterval(interval);
  }, [sessionId, currentImage]);

  if (!currentImage) {
    return loading ? (
      <div className="mt-4 p-4 text-center text-gray-500">
        Waiting for scene generation...
      </div>
    ) : null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Generated Scene</h3>
      <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={`http://localhost:3001${currentImage}`}
          alt="Generated scene"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}