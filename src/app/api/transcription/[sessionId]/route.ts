import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Get the absolute path to metadata directory
const METADATA_DIR = path.join(process.cwd(), 'metadata');

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
    const { sessionId } = params;
    console.log('Looking for transcription file:', sessionId);
    const transcriptionPath = path.join(METADATA_DIR, `${sessionId}-transcription.json`);
    console.log('Full path:', transcriptionPath);

    try {
        const data = await fs.readFile(transcriptionPath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error(`Error fetching transcription for session ${sessionId}:`, error);
        return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }
}