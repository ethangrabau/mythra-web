'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface ImageDisplayProps {
  sessionId: string;
}

const ImageDisplay = ({ sessionId }: ImageDisplayProps) => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const checkForNewImage = async () => {
        try {
          console.log('Checking for new image for session:', sessionId);
          const response = await fetch(`http://localhost:3001/api/images/latest/${sessionId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.imagePath) {
              console.log('New image found:', data.imagePath);
              setCurrentImage(data.imagePath);
            }
          } else {
            console.log('No image available yet:', response.status);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
        }
      };

    checkForNewImage();
    const interval = setInterval(checkForNewImage, 5000);

    return () => clearInterval(interval);
  }, [sessionId]);

  if (!currentImage) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Generated Scene</h3>
      <div className="relative w-full h-64 md:h-96">
        <Image
          src={`http://localhost:3001${currentImage}`}
          alt="Generated scene"
          fill
          className="rounded-lg object-contain"
        />
      </div>
    </div>
  );
};

export default ImageDisplay;