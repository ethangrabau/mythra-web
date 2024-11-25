import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IFaction extends Document {
  name: string;
  //TODO: fill out other properties
}

const FactionSchema = new Schema<IFaction>({
  name: { type: String, required: true },
  //TODO: fill out other properties
});
