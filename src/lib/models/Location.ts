import mongoose, { Document, Schema, Types, model } from 'mongoose';

// Interface for Location
export interface ILocation extends Document {
  name: string;
  description: string;
  imageUrl?: string;
  transcriptionId?: Types.ObjectId; // Reference to Transcription if description is generated via speech-to-text
  type?: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'other';
  coordinates?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  campaigns: Types.ObjectId[]; // Campaigns that feature this location
  quests: Types.ObjectId[]; // Quests associated with this location
  npcs: Types.ObjectId[]; // NPCs located here
  encounters: Types.ObjectId[]; // Encounters that can occur here
  history?: string; // Historical background
  tags?: string[]; // For categorization and searchability
  isDiscovered?: boolean; // Whether the players have discovered this location
  notes?: {
    dm: string[]; // Private DM notes
    player: string[]; // Notes shared with players
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Schema for Location
const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String },
    transcriptionId: { type: Schema.Types.ObjectId, ref: 'Transcription' },
    type: {
      type: String,
      enum: ['city', 'town', 'village', 'dungeon', 'wilderness', 'other'],
      default: 'other',
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
      altitude: { type: Number },
    },
    campaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
    quests: [{ type: Schema.Types.ObjectId, ref: 'Quest' }],
    npcs: [{ type: Schema.Types.ObjectId, ref: 'NPC' }], // Assuming you have an NPC model
    encounters: [{ type: Schema.Types.ObjectId, ref: 'Encounter' }], // Assuming you have an Encounter model
    history: { type: String },
    tags: [String],
    isDiscovered: { type: Boolean, default: false },
    notes: {
      dm: [String],
      player: [String],
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
LocationSchema.index({ name: 1 });
LocationSchema.index({ tags: 1 });
LocationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

// Static methods (if needed)
LocationSchema.statics.findByCampaign = function (campaignId: Types.ObjectId) {
  return this.find({ campaigns: campaignId }).sort('name');
};

// Export the model
export const Location = mongoose.models.Location || model<ILocation>('Location', LocationSchema);
