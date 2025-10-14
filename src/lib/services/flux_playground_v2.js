import axios from 'axios';
import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';
import { normalizeSessionId } from '../utils/session.js';

const rootDir = process.cwd();
const API_KEY = process.env.BFL_API_KEY;

export const generateImageFlux = async (prompt, sessionId, width = 1024, height = 768) => {
  const normalizedSessionId = normalizeSessionId(sessionId);
  console.log('Image generation session ID:', {
    original: sessionId,
    normalized: normalizedSessionId
  });

  const promptPrefix =
    "High-fantasy, photorealistic illustration for a DND campaign. The scene should evoke epic adventure, rich in detail, dramatic lighting, and set in a magical world. The story is about the following: ";
  const fullPrompt = `${promptPrefix}${prompt}`;

  try {
    // Normalize the session ID
    console.log('Session ID handling:', {
      original: sessionId,
      normalized: normalizedSessionId
    });

    // Ensure the images directory exists
    const dirPath = path.join(rootDir, 'generated_images');
    console.log('Checking images directory:', dirPath);
    if (!fs.existsSync(dirPath)) {
      console.log('Creating images directory...');
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Step 1: Send the image generation request with maximum permissive settings
    console.log('Sending image generation request...');
    const requestResponse = await axios.post(
      'https://api.bfl.ml/v1/flux-pro-1.1',
      {
        prompt: fullPrompt,
        width: width,
        height: height,
        num_inference_steps: 50,  // Increased for better quality
        guidance_scale: 7.5,      // Increased for stronger prompt adherence
        num_images: 1,
        safety_tolerance: "6",    // Most permissive setting
        output_format: "png",     // Higher quality output
        sync_mode: true          // Wait for completion
      },
      {
        headers: {
          accept: 'application/json',
          'x-key': API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    const requestId = requestResponse.data.id;
    console.log('Request ID:', requestId);

    // Step 2: Poll for the result
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 60;
    
    while (!imageUrl && attempts < maxAttempts) {
      console.log(`Waiting for image generation... Attempt ${attempts + 1}/${maxAttempts}`);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const resultResponse = await axios.get(
        'https://api.bfl.ml/v1/get_result',
        {
          headers: {
            accept: 'application/json',
            'x-key': API_KEY,
          },
          params: {
            id: requestId,
          },
        }
      );

      if (resultResponse.data.status === 'Ready') {
        imageUrl = resultResponse.data.result.sample;
      } else {
        console.log(`Status: ${resultResponse.data.status}`);
        attempts++;
      }
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out');
    }

    console.log(`Image URL: ${imageUrl}`);

    // Step 3: Download and save the image
    console.log('Downloading image...');
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    const timestamp = Date.now();
    const filename = `${normalizedSessionId}-${timestamp}.png`;
    const imagePath = path.join(dirPath, filename);
    
    console.log(`Saving image to: ${imagePath}`);
    await fs.promises.writeFile(imagePath, imageResponse.data);
    console.log('Image saved successfully');

    // Notify WebSocket server with normalized session ID
    try {
      console.log('Notifying WebSocket server...');
      const ws = new WebSocket('ws://localhost:8080');
      
      await new Promise((resolve) => {
        ws.onopen = () => {
          const message = {
            type: 'newImage',
            sessionId: normalizedSessionId,
            imagePath: `/api/images/${filename}`
          };
          console.log('Sending WebSocket message:', message);
          ws.send(JSON.stringify(message));
          ws.close();
          console.log('WebSocket notification sent');
          resolve();
        };
      });
    } catch (wsError) {
      console.error('Error notifying WebSocket server:', wsError);
    }

    return `/api/images/${filename}`;
  } catch (error) {
    console.error('Error during image generation:', error);
    console.error('Stack trace:', error.stack);
    return null;
  }
};

// Test function
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const testPrompt = `A hyper-realistic dragon with metallic scales breathing fire into the night sky. The scene is illuminated by the intense flames.`;
    const testSessionId = `test-session-${Date.now()}`;

    try {
      const imagePath = await generateImageFlux(testPrompt, testSessionId);
      if (imagePath) {
        console.log(`Image saved successfully: ${imagePath}`);
      } else {
        console.error('Image generation failed.');
      }
    } catch (error) {
      console.error('Error during test execution:', error);
    }
  })();
}
