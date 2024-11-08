import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_KEY = process.env.BFL_API_KEY; // Ensure the API key is in your .env file

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateImageFlux = async (prompt, width = 1024, height = 768) => {
  const promptPrefix =
    "High-fantasy, photorealistic illustration for a DND campaign. The scene should evoke epic adventure, rich in detail, dramatic lighting, and set in a magical world. The story is about the following: ";
  const fullPrompt = `${promptPrefix}${prompt}`;

  try {
    // Step 1: Send the image generation request
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

    // Step 2: Poll for the result
    let imageUrl = null;
    while (!imageUrl) {
      console.log('Waiting for image generation...');
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay

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
      }
    }

    console.log(`Image URL: ${imageUrl}`);

    // Step 3: Download and save the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imagePath = path.join(__dirname, 'generated_image_flux.png'); // Save image in the same directory
    fs.writeFileSync(imagePath, imageResponse.data);
    console.log(`Image saved at: ${imagePath}`);

    return imagePath; // Return the path to the saved image
  } catch (error) {
    console.error('Error during image generation:', error.message);
    return null;
  }
};

// Test the function
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const testPrompt = `Todd, the radiant Asmere Paladin, stands tall in his celestial armor. His long, silver-white hair cascades over gleaming golden and silver armor, adorned with intricate celestial etchings of angelic wings and holy symbols. 
            A radiant halo illuminates the area around him, casting soft light on the majestic chest plate emblazoned with divine markings. 
            His shoulders are protected by golden pauldrons shaped like angelic wings. 
            In his right hand, Todd wields a mighty longsword with runes glowing faintly along its blade, and at his side hangs a shield inscribed with sacred inscriptions. 
            The setting is a high mountain pass, with the sun rising in the distance, bathing the scene in golden light as Todd surveys the horizon, his armor shimmering like a beacon of hope.`;

    try {
      const imagePath = await generateImageFlux(testPrompt);
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
