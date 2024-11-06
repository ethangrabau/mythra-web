import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import { join } from 'path';

const METADATA_DIR = './metadata';

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
    const { sessionId } = params;
    const transcriptionPath = join(METADATA_DIR, `${sessionId}-transcription.json`);

    try {
        const data = await fs.readFile(transcriptionPath, 'utf-8');
        return NextResponse.json(JSON.parse(data)); // Return the transcription data as JSON
    } catch (error) {
        console.error(`Error fetching transcription for session ${sessionId}:`, error);
        return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }
}
