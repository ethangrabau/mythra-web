import mongoose, { Document, Types, Schema } from 'mongoose';

export interface ISession extends Document {
  campaignId: Types.ObjectId;
  sessionNumber: number;
  date: Date;
  location: {
    name: string;
    isVirtual: boolean;
    platform?: string; //e.g. Roll20, FoundryVTT, etc.
  };
  summary: string;
  combatEncounters: {
    name: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    outcome: string;
  }[];
  questProgress: {
    questName: string;
    status: 'started' | 'advanced' | 'completed' | 'failed';
    notes?: string;
  }[];
  npcsIntroduced: {
    name: string;
    description: string;
    location: string;
    isAlive: boolean;
  }[];
  lootAwarded: {
    item: string;
    quantity: number;
    characterId: Types.ObjectId; // The character who received the loot
    value?: number; // In gold pieces
  }[];
  importantLocations: {
    name: string;
    imageUrl?: string;
  }[];
  characterUpdates: {
    characterId: Types.ObjectId;
    levelUp: boolean;
    significantItems: string[];
    notes: string;
  }[];
  notes: {
    private: string; // DM-only notes
    public: string; // Notes shared with players
  };
  attendance: {
    playerId: Types.ObjectId;
    characterId: Types.ObjectId;
    present: boolean;
  }[];
}

// Schemas
const SessionSchema = new Schema<ISession>(
  {
    campaignId: { type: Schema.Types.ObjectId, required: true, ref: 'Campaign' },
    sessionNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    location: {
      name: String,
      isVirtual: Boolean,
      platform: String,
    },
    summary: String,
    combatEncounters: [
      {
        name: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard', 'deadly'],
        },
        outcome: String,
      },
    ],
    questProgress: [
      {
        questName: String,
        status: {
          type: String,
          enum: ['started', 'advanced', 'completed', 'failed'],
        },
        notes: String,
      },
    ],
    npcsIntroduced: [
      {
        name: String,
        description: String,
        location: String,
        isAlive: { type: Boolean, default: true },
      },
    ],
    lootAwarded: [
      {
        item: String,
        quantity: Number,
        characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
        value: Number,
      },
    ],
    importantLocations: [
      {
        name: String,
        imageUrl: String,
      },
    ],
    characterUpdates: [
      {
        characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
        levelUp: Boolean,
        significantItems: [String],
        notes: String,
      },
    ],
    notes: {
      private: String,
      public: String,
    },
    attendance: [
      {
        playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
        characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
        present: Boolean,
      },
    ],
  },
  { timestamps: true }
); // This adds createdAt and updatedAt automatically

export const Session = mongoose.model<ISession>('Session', SessionSchema);
