// Apply a patch to the memory, merging updates intelligently
export function applyPatch(memory, patch) {
  // Helper to upsert entities
  const upsert = (arr, incoming) => {
    for (const entity of incoming || []) {
      if (!entity.name) continue;
      
      // Find existing entity by name or aliases
      const existingIndex = arr.findIndex(existing => {
        // Check direct name match
        if (existing.name.toLowerCase() === entity.name.toLowerCase()) return true;
        
        // Check if new name matches existing aliases
        if (existing.aliases?.some(alias => alias.toLowerCase() === entity.name.toLowerCase())) return true;
        
        // Check if new aliases match existing name
        if (entity.aliases?.some(alias => alias.toLowerCase() === existing.name.toLowerCase())) return true;
        
        return false;
      });
      
      if (existingIndex >= 0) {
        // Update existing entity
        const existing = arr[existingIndex];
        arr[existingIndex] = {
          ...existing,
          // Merge aliases (unique, max 5)
          aliases: Array.from(new Set([
            ...(existing.aliases || []),
            ...(entity.aliases || [])
          ])).slice(0, 5),
          // Update description if provided, keep under 240 chars
          description: entity.description 
            ? entity.description.substring(0, 240)
            : existing.description,
        };
      } else {
        // Add new entity
        arr.push({
          name: entity.name.substring(0, 60),
          aliases: (entity.aliases || []).slice(0, 5).map(a => a.substring(0, 40)),
          description: (entity.description || '').substring(0, 240)
        });
      }
    }
  };
  
  // Apply upserts
  upsert(memory.characters, patch.characters_upsert);
  upsert(memory.items, patch.items_upsert);
  upsert(memory.locations, patch.locations_upsert);
  
  // Apply deletions (by name since we don't have IDs)
  const deleteByNames = (arr, namesToDelete) => {
    if (!namesToDelete?.length) return arr;
    return arr.filter(entity => 
      !namesToDelete.some(nameToDelete => 
        entity.name.toLowerCase() === nameToDelete.toLowerCase()
      )
    );
  };
  
  if (patch.deletions) {
    memory.characters = deleteByNames(memory.characters, patch.deletions.characters);
    memory.items = deleteByNames(memory.items, patch.deletions.items);
    memory.locations = deleteByNames(memory.locations, patch.deletions.locations);
  }
  
  return memory;
}