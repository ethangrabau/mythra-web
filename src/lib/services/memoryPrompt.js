export const generateMemoryPrompt = (transcription, memory, recentContext) => {
    // Create a compact index of existing entities (just names and IDs)
    const memoryIndex = {
      characters: memory.characters.map(c => ({ name: c.name, aliases: [] })),
      items: memory.items.map(i => ({ name: i.name, aliases: [] })),
      locations: memory.locations.map(l => ({ name: l.name, aliases: [] }))
    };

    return `
      You maintain a JSON Memory Table for a live RPG session. Output only a PATCH object as strict JSON.
      Do not output the full memory. Never alter core traits unless transcript explicitly contradicts them.
      
      ### PATCH SCHEMA ###
      {
        "characters_upsert": [{"name": "str<=60", "aliases": ["str<=40"], "description": "str<=240"}],
        "items_upsert": [{"name": "str<=60", "aliases": ["str<=40"], "description": "str<=240"}],
        "locations_upsert": [{"name": "str<=60", "aliases": ["str<=40"], "description": "str<=240"}],
        "deletions": {"characters": [], "items": [], "locations": []}
      }
      
      ### CURRENT MEMORY INDEX ###
      ${JSON.stringify(memoryIndex)}
      
      ### RECENT CONTEXT ###
      "${recentContext?.substring(0, 500) || ''}"
      
      ### NEW TRANSCRIPTION ###
      "${transcription}"
      
      ### RULES ###
      - Touch ONLY entities mentioned in NEW TRANSCRIPTION
      - If entity exists (check name/aliases), update it
      - If entity is new, add it
      - Keep descriptions <= 240 chars, focus on VISUAL details
      - Return empty arrays if nothing changed
      - Output JSON PATCH only. No prose. No code fences.`;
};