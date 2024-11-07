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
    recipient: string; // Character name or "party"
    value?: number; // In gold pieces
  }[];
  importantLocations: string[];
  playerCharacterUpdates: {
    characterName: string;
    levelUp: boolean;
    significantItems: string[];
    notes: string;
  }[];
  notes: {
    private: string; // DM-only notes
    public: string; // Notes shared with players
  };
  attendance: {
    playerName: string;
    characterName: string;
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
        recipient: String,
        value: Number,
      },
    ],
    importantLocations: [String],
    playerCharacterUpdates: [
      {
        characterName: String,
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
        playerName: String,
        characterName: String,
        present: Boolean,
      },
    ],
  },
  { timestamps: true }
); // This adds createdAt and updatedAt automatically

export const Session = mongoose.model<ISession>('Session', SessionSchema);
