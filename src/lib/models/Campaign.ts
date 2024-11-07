import mongoose, { Document, Types, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description: string;
  dmId: Types.ObjectId;
  players: {
    userId: Types.ObjectId;
    characterName: string;
    characterClass: string;
    characterLevel: number;
    isActive: boolean;
  }[];
  setting: string;
  startDate: Date;
  endDate?: Date;
  level: {
    start: number;
    current: number;
  };
  status: 'planning' | 'active' | 'completed' | 'hiatus';
  nextSessionDate?: Date;
  tags: string[];
  homebrewRules?: string[];
}

// Schemas
const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    dmId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    players: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        characterName: String,
        characterClass: String,
        characterLevel: Number,
        isActive: { type: Boolean, default: true },
      },
    ],
    setting: String,
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    level: {
      start: { type: Number, required: true },
      current: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed', 'hiatus'],
      default: 'planning',
    },
    nextSessionDate: Date,
    tags: [String],
    homebrewRules: [String],
  },
  { timestamps: true }
); // This adds createdAt and updatedAt automatically

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
