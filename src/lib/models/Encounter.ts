import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IEncounter extends Document {
  name: string;
  //TODO: fill out other properties
}

const EncounterSchema = new Schema<IEncounter>({
  name: { type: String, required: true },
  //TODO: Add other properties later
});

export const Encounter = mongoose.models.Encounter || model<IEncounter>('Encounter', EncounterSchema);
