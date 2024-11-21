// src/lib/constants/paths.js
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get root project directory (3 levels up from lib/constants)
const PROJECT_ROOT = join(__dirname, '../../..');

export const PATHS = {
  AUDIO_DIR: join(PROJECT_ROOT, 'audio-chunks'),
  RECORDINGS_DIR: join(PROJECT_ROOT, 'recordings'),
  METADATA_DIR: join(PROJECT_ROOT, 'metadata'),
  IMAGES_DIR: join(PROJECT_ROOT, 'generated_images')
};