export const generateMemoryPrompt = (transcription, memory) => {
    return `
      You are managing a dynamic memory table for a Dungeons and Dragons game (DND). 
      The memory table contains characters, items, and locations. 

      You will receive:
        1. The current transcription.
        2. The current memory table.
  
      ### Your Task ###
      Based on the new transcription and current memory table, update the memory table to include any new or updated details. 
      - Do not delete or remove existing entries unless explicitly contradicted in the transcription.
      - Merge any duplicate or overlapping entries. For example, if "Bruce the warrior" and "Bruce" refer to the same character, combine their details into a single entry.
      - Include only details explicitly mentioned in the transcription.
      - Ensure the updated memory table remains logically consistent.
      - Include only the updated memory table in JSON format without additional text.

  
      ### Memory Table Before Update ###
      ${JSON.stringify(memory, null, 2)}
  
      ### New Transcription ###
      "${transcription}"
  
      ### Updated Memory Table ###
      Provide the updated memory table as a valid JSON object.
  
      ### Examples ###
  
      Example 1:
      Transcription: "Bruce, a tall Goliath warrior with a glowing sword, stands on the edge of the battlefield."
      Memory Table Before Update:
      {
        "characters": [
          { "name": "Bruce", "description": "A Goliath warrior." }
        ],
        "items": [
          { "name": "Glowing Sword", "description": "A faintly glowing sword." }
        ],
        "locations": []
      }
      Updated Memory Table:
      {
        "characters": [
          { "name": "Bruce", "description": "A tall Goliath warrior with a glowing sword, standing on the edge of the battlefield." }
        ],
        "items": [
          { "name": "Glowing Sword", "description": "A faintly glowing sword owned by Bruce." }
        ],
        "locations": []
      }
  
      Example 2:
      Transcription: "Todd, the radiant Asmere Paladin, studies an ancient map in the ruins of a long-forgotten temple."
      Memory Table Before Update:
      {
        "characters": [],
        "items": [],
        "locations": []
      }
      Updated Memory Table:
      {
        "characters": [
          { "name": "Todd", "description": "A radiant Asmere Paladin studying an ancient map in the ruins of a temple." }
        ],
        "items": [
          { "name": "Ancient Map", "description": "A weathered map being studied by Todd." }
        ],
        "locations": [
          { "name": "Temple Ruins", "description": "A long-forgotten temple with ancient ruins." }
        ]
      }
  
      Example 3:
      Transcription: "A goblin ambushes Bruce and Todd as they enter a dark cave covered in moss."
      Memory Table Before Update:
      {
        "characters": [
          { "name": "Bruce", "description": "A tall Goliath warrior." },
          { "name": "Todd", "description": "A radiant Asmere Paladin." }
        ],
        "items": [
          { "name": "Glowing Sword", "description": "A faintly glowing sword owned by Bruce." }
        ],
        "locations": [
          { "name": "Temple Ruins", "description": "A long-forgotten temple with ancient ruins." }
        ]
      }
      Updated Memory Table:
      {
        "characters": [
          { "name": "Bruce", "description": "A tall Goliath warrior ambushed by a goblin in a mossy cave." },
          { "name": "Todd", "description": "A radiant Asmere Paladin ambushed by a goblin in a mossy cave." },
          { "name": "Goblin", "description": "A creature ambushing Bruce and Todd in a mossy cave." }
        ],
        "items": [
          { "name": "Glowing Sword", "description": "A faintly glowing sword owned by Bruce." }
        ],
        "locations": [
          { "name": "Temple Ruins", "description": "A long-forgotten temple with ancient ruins." },
          { "name": "Mossy Cave", "description": "A dark cave covered in moss, where Bruce and Todd were ambushed." }
        ]
      }
  
      ### End of Examples ###
  
     ### Output:
        Provide the updated memory table as valid JSON, ensuring it includes:
        - Updated characters, items, and locations.
        - Updated processedChunks array to track handled transcription chunks.
  `;
};