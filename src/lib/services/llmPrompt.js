/**
 * Generate the LLM prompt for memory updates.
 *
 * @param {string} recentActivity - The recent transcription activity.
 * @param {object} currentMemory - The current state of memory.
 * @returns {string} - The LLM prompt.
 */
export const generateLLMPrompt = (recentActivity, currentMemory) => {
    return `
  You are a memory manager for a Dungeons & Dragons story. Here's the current transcription of recent activity:
  ---
  ${recentActivity}
  
  Current Memory:
  ${JSON.stringify(currentMemory, null, 2)}
  
  Update the memory by extracting:
  1. New characters, locations, or items introduced.
  2. Significant events or actions worth storing in long-term memory.
  Respond in JSON format with "characters", "locations", and "items".
    `;
  };
  