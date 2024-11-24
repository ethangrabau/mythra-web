import { NextResponse } from 'next/server';
import { join } from 'path';
import { readdirSync } from 'fs';

export async function GET() {
  try {
    const imagesDirPath = join(process.cwd(), 'generated_images');
    const files = readdirSync(imagesDirPath)
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        const getTimestamp = (filename: string) => {
          const match = filename.match(/-(\d+)\.png$/);
          return match ? parseInt(match[1]) : 0;
        };
        return getTimestamp(a) - getTimestamp(b);
      });

    return NextResponse.json({ 
      images: files.map(file => `/api/images/${file}`)
    });
  } catch (error) {
    console.error('Error reading images directory:', error);
    return NextResponse.json({ error: 'Failed to read images' }, { status: 500 });
  }
}