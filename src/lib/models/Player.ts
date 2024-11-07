import { Schema, model, Document, Types } from 'mongoose';

// Player Interface
interface IPlayer extends Document {
  email: string;
  username: string;
  displayName: string;
  discord?: string;
  timezone: string;
  availability: {
    dayOfWeek: number; // 0-6 for Sunday-Saturday
    startTime: string; // "HH:mm" format
    endTime: string;
  }[];
  activeCampaigns: Types.ObjectId[]; // Reference to campaigns where isActive
}
