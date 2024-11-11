import mongoose from 'mongoose';
import dotenv from 'dotenv';

//This file should only ever be used by the seeder script
export async function connectToDatabase() {
  //Load the env variables for the seeder
  dotenv.config({ path: '.env.local' });

  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to the datbase for seeding');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}
