import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Player Interface
interface IPlayer extends Document {
  email: string;
  username: string;
  discord?: string;
  timezone?: string;
  availability?: {
    dayOfWeek: number; // 0-6 for Sunday-Saturday
    startTime: string; // "HH:mm" format
    endTime: string;
  }[];
  activeCampaigns: Types.ObjectId[]; // Reference to campaigns where isActive
}

// Schema
const PlayerSchema = new Schema<IPlayer>(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    discord: String,
    timezone: { type: String, required: false },
    availability: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 },
        startTime: String,
        endTime: String,
      },
    ],
    activeCampaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
  },
  { timestamps: true }
);

export const Player = mongoose.models.Player || model<IPlayer>('Player', PlayerSchema);
