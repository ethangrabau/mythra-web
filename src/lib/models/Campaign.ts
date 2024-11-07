import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  dmId: ObjectId;
  players: {
    userId: ObjectId;
    characterId: ObjectId;
  }[];
  setting: string; //e.g. Forgotten Realms, Eberron, etc.
  level: {
    start: number;
    current: number;
  };
  status: 'planning' | 'active' | 'completed' | 'hiatus';
  nextSession?: Date;
  tags: string[];
  homebrewRules?: string[];
}

const CampaignSchema = new Schema<ICampaign>({
  name: { type: String, required: true },
  description: { type: String, required: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: false },
  dmId: { type: Schema.Types.ObjectId, required: true },
});
