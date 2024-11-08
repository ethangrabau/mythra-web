import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate an image prompt using the LLM.
 *
 * @param {string} transcription - The latest transcription chunk.
 * @param {string} recentActivity - The recent activity from previous transcriptions.
 * @param {object} memory - The current memory object (characters, items, locations).
 * @returns {string|null} - The generated image prompt or null if no prompt is needed.
 */
export const generateImagePrompt = async (transcription, recentActivity, memory) => {
  // Constructing the prompt
  const prompt = `
    You are a creative assistant tasked with generating image prompts for a DND campaign. 
    Based on the transcription, recent activity, and memory, decide if an image prompt is needed. 
    If there is a significant visual change, craft a detailed and coherent image prompt.
    Include relevant characters, items, and locations to ensure visual consistency. 
    Use vivid, high-fantasy language and avoid redundancies.

    If no image is needed, return: "No image needed."
    
    ### Inputs ###
    Transcription: "${transcription}"
    Recent Activity: "${recentActivity}"
    Memory: ${JSON.stringify(memory, null, 2)}
    
    ### Output Example ###
    If an image is needed: 
    "Prompt: A radiant paladin stands on a mountain, with his glowing sword raised high under a stormy sky."

    If no image is needed:
    "No image needed."
  `;

  try {
    console.log('Calling LLM for image prompt...');

    // Correcting the OpenAI API call to match the new ES module format
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract and process the response
    const result = response.choices[0]?.message?.content?.trim();
    console.log('LLM Response:', result);

    if (!result || result.toLowerCase() === 'no image needed') {
      return null; // No image needed as per LLM's response
    }

    // Return the extracted image prompt, removing "Prompt:" if present
    return result.replace(/^Prompt:/i, '').trim();
  } catch (error) {
    console.error('Error generating image prompt:', error.message);
    return null; // Gracefully handle errors by returning null
  }
};
