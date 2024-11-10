import mongoose, { Document, Types, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description: string;
  dmId: Types.ObjectId;
  players: {
    playerId: Types.ObjectId;
    characterId: Types.ObjectId;
    isActive: boolean;
    joinDate: Date;
    leaveDate?: Date;
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
    dmId: { type: Schema.Types.ObjectId, required: true, ref: 'Player' },
    players: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
        characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
        isActive: { type: Boolean, default: true },
        joinDate: { type: Date, default: Date.now },
        leaveDate: Date,
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

export const Campaign = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);