import fs from 'fs/promises';
import path from 'path';

export async function POST() {
  const memoryLogPath = path.join(process.cwd(), 'metadata/memory-log.txt');
  console.log('API invoked: /api/delete-memory-log');
  console.log('Resolved memory log path:', memoryLogPath);

  try {
    // Check if file exists
    await fs.access(memoryLogPath);
    console.log('File exists, attempting to delete...');

    // Attempt to delete the file
    await fs.unlink(memoryLogPath);
    console.log('Memory log deleted successfully.');
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error during deletion:', error);

    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.warn('File not found, returning success response.');
      return new Response(
        JSON.stringify({ success: true, message: 'File already deleted' }),
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Failed to delete memory log' }),
      { status: 500 }
    );
  }
}
