import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface INote extends Document {
  campaignId: Types.ObjectId;
  description: string;
  tags: string[];
}
