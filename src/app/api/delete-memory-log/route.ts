// app/api/delete-memory-log/route.ts
import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  const memoryLogPath = path.join(process.cwd(), 'metadata', 'memory-log.txt');
  
  try {
    // Create a new empty memory file
    const initialMemory = {
      characters: [],
      items: [],
      locations: [],
    };
    
    // Write the empty memory state
    await fs.writeFile(memoryLogPath, JSON.stringify(initialMemory, null, 2));
    console.log('Memory reset successfully');
    
    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to reset memory:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to reset memory' }), 
      { status: 500 }
    );
  }
}