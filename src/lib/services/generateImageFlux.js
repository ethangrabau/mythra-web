import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.BFL_API_KEY;

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateImageFlux = async (prompt, sessionId, width = 1024, height = 768) => {
  const promptPrefix =
    "High-fantasy, photorealistic illustration for a DND campaign. The scene should evoke epic adventure, rich in detail, dramatic lighting, and set in a magical world. The story is about the following: ";
  const fullPrompt = `${promptPrefix}${prompt}`;

  try {
    // Ensure the images directory exists
    const dirPath = path.join(__dirname, '..', '..', 'generated_images');
    console.log('Checking images directory:', dirPath);
    if (!fs.existsSync(dirPath)) {
      console.log('Creating images directory...');
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Step 1: Send the image generation request
    console.log('Sending image generation request...');
    const requestResponse = await axios.post(
      'https://api.bfl.ml/v1/flux-pro-1.1',
      {
        prompt: fullPrompt,
        width: width,
        height: height,
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
    const maxAttempts = 60; // 30 seconds maximum wait time
    
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
    
    // Create a filename with session ID and timestamp
    const timestamp = Date.now();
    const filename = `${sessionId}-${timestamp}.png`;
    const imagePath = path.join(dirPath, filename);
    
    // Save the image
    console.log(`Saving image to: ${imagePath}`);
    await fs.promises.writeFile(imagePath, imageResponse.data);
    console.log('Image saved successfully');

    // Notify the WebSocket server about the new image
    try {
      console.log('Notifying WebSocket server...');
      const ws = new WebSocket('ws://localhost:8080');
      await new Promise((resolve) => ws.on('open', resolve));
      
      const message = {
        type: 'newImage',
        sessionId: sessionId,
        imagePath: `/api/images/${filename}`
      };
      console.log('Sending WebSocket message:', message);
      
      ws.send(JSON.stringify(message));
      ws.close();
      console.log('WebSocket notification sent');
    } catch (wsError) {
      console.error('Error notifying WebSocket server:', wsError);
      // Continue even if WebSocket notification fails
    }

    return `/api/images/${filename}`;
  } catch (error) {
    console.error('Error during image generation:', error);
    console.error('Stack trace:', error.stack);
    return null;
  }
};

// Test the function
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const testPrompt = `Todd, the radiant Asmere Paladin, stands tall in his celestial armor...`;
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