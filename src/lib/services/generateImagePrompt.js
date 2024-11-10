import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const generateImagePrompt = async (transcription, recentActivity, memory) => {
  const prompt = `
    You are a creative assistant tasked with generating image prompts for a DND campaign. 
    Based on the transcription, recent activity, and memory, decide if an image prompt is needed. 
    Only generate a new image if there is a significant visual scene change or important character moment.

    Rules for deciding if an image is needed:
    - Must be a new visual scene or location
    - Must involve clear visual elements that would make a compelling image
    - Should avoid generating images for simple movements or minor actions
    - Should focus on epic moments, location changes, or significant character introductions

    If no image is needed, return exactly: "No image needed"
    If an image is needed, start your response with "Generate image:"
    
    ### Inputs ###
    Transcription: "${transcription}"
    Recent Activity: "${recentActivity}"
    Memory: ${JSON.stringify(memory, null, 2)}
  `;

  try {
    console.log('Calling LLM for image prompt...');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
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