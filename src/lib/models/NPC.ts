import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface INPC extends Document {
  name: string;
  //TODO: fill out other properties
}

const NPCSchema = new Schema<INPC>({
  name: { type: String, required: true },
  //TODO: fill out other properties
});

export const NPC = mongoose.models.NPC || model<INPC>('NPC', NPCSchema);
