// audioSession.js
import fs from 'fs/promises';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import TranscriptionService from './src/lib/services/transcription.js';

const AUDIO_DIR = join(__dirname, 'audio-chunks');
const RECORDINGS_DIR = join(__dirname, 'recordings');
const METADATA_DIR = join(__dirname, 'metadata');

// Ensure necessary directories exist
mkdirSync(AUDIO_DIR, { recursive: true });
mkdirSync(RECORDINGS_DIR, { recursive: true });
mkdirSync(METADATA_DIR, { recursive: true });

export class AudioSession {
  constructor(sessionId, transcriptionService) {
    this.sessionId = sessionId;
    this.startTime = Date.now();
    this.chunks = new Map();
    this.status = 'initializing';
    this.transcriptionService = transcriptionService;
    this.metadata = {
      totalDuration: 0,
      totalSize: 0,
      lastChunkId: -1,
      checksums: new Set(),
      transcription: null
    };
  }

  async addChunk(chunkId, data) {
    try {
      const calculatedChecksum = crypto.createHash('sha256').update(Buffer.from(data)).digest('hex');
      if (this.metadata.checksums.has(calculatedChecksum)) {
        throw new Error('Duplicate chunk detected');
      }

      // Save the chunk
      const chunkPath = join(AUDIO_DIR, this.sessionId, `chunk-${chunkId}.webm`);
      await fs.writeFile(chunkPath, data);

      this.chunks.set(chunkId, { path: chunkPath, size: data.length });
      this.metadata.lastChunkId = chunkId;
      this.metadata.checksums.add(calculatedChecksum);
      this.metadata.totalSize += data.length;
      this.metadata.totalDuration += 1000; // Assuming each chunk is 1 second

      await this.saveMetadata();
    } catch (error) {
      console.error(`Error processing chunk ${chunkId}:`, error);
      throw error;
    }
  }

  async saveMetadata() {
    const metadataPath = join(METADATA_DIR, `${this.sessionId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(this.metadata, null, 2));
  }

  async finalize() {
    const outputPath = join(RECORDINGS_DIR, `recording-${this.sessionId}.webm`);
    const output = createWriteStream(outputPath);

    for (let i = 0; i <= this.metadata.lastChunkId; i++) {
      const chunk = this.chunks.get(i);
      const chunkData = await fs.readFile(chunk.path);
      output.write(chunkData);
    }
    await new Promise((resolve) => output.end(resolve));

    // Transcribe the concatenated audio file
    const transcription = await this.transcriptionService.transcribeFile(outputPath, this.sessionId);
    this.metadata.transcription = transcription;
    this.status = 'completed';
    await this.saveMetadata();

    return { path: outputPath, transcription };
  }
}
