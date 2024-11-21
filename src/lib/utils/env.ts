import * as dotenv from 'dotenv';
import path from 'path';

export function loadEnv() {
  console.log('Loading environment variables from .env.local');
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

  if (!process.env.MONGODB_URI) {
    console.log('MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
}

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
