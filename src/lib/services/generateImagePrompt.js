import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateImagePrompt = async (transcription, recentActivity, memory) => {
  const prompt = `
    You are a creative assistant tasked with generating image prompts for a DND campaign. 
    Based on the transcription, recent activity, and memory, create a detailed image prompt.
    
    ### CRITICAL RULES FOR IMAGE GENERATION ###
    1. FOCUS ON THE CURRENT SCENE described in the transcription
    2. Include SPECIFIC character details from memory (race, hair, clothing, weapons)
    3. Describe the CURRENT ACTION happening right now
    4. Include the CURRENT LOCATION/SETTING
    5. Be visually specific - colors, lighting, positioning, emotions
    
    ### Character Reference from Memory ###
    Use these EXACT character descriptions when they appear:
    ${memory.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')}
    
    ### Current Scene Context ###
    What just happened: "${recentActivity}"
    What's happening now: "${transcription}"
    
    ### Image Generation Decision ###
    - Generate images for ANY scene with visual elements
    - Generate images for character actions, locations, items, combat
    - Only skip if text is purely meta (like "stop recording")
    
    If no image is needed, return exactly: "No image needed"
    If an image is needed, start with "Generate image:" followed by a detailed visual description
    
    Focus on making the current scene vivid and consistent with established character appearances.
  `;

  try {
    console.log('Calling LLM for image prompt...');
    console.log('Using model:', process.env.LLM_MODEL_IMAGEPROMPT || 'gpt-5-mini');

    const response = await openai.chat.completions.create({
      model: process.env.LLM_MODEL_IMAGEPROMPT || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const result = response.choices[0]?.message?.content?.trim();
    console.log('Raw LLM Response:', result);

    if (!result || result.toLowerCase() === 'no image needed') {
      console.log('LLM decided no image is needed');
      return null;
    }

    if (!result.toLowerCase().startsWith('generate image:')) {
      console.log('Unexpected LLM response format');
      return null;
    }

    // Return the cleaned prompt
    return result.replace(/^generate image:/i, '').trim();
  } catch (error) {
    console.error('Error generating image prompt:', error.message);
    return null;
  }
};