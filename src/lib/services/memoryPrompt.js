export const generateMemoryPrompt = (transcription, memory) => {
    return `
      You are managing a dynamic memory table for a Dungeons and Dragons game (DND). 
      The memory table includes characters, items, locations, and recent activity. 
      You will be given a transcription of the current scene and the memory table. 
      Update the memory table with any new details from the transcription strictly as presented. 
      Do not assume or infer information beyond the transcription, and only update details relevant to named characters, items, or locations. 
      Update the recent activity with a short summary of the latest events. 
      Ensure the response is a valid JSON object containing the updated memory fields (characters, items, locations, recent activity summary).
  
      ### Examples ###
      ${/* Include your detailed examples here, as in the Python implementation */ ""}
  
      ### End of Examples ###
  
      Transcription: "${transcription}"
  
      Current Memory: ${JSON.stringify(memory, null, 2)}
  
      Provide the updated memory in JSON format.
    `;
  };
  