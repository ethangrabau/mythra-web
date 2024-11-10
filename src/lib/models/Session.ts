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
  transcriptions?: Types.ObjectId[]; // Reference to Transcription
  combatEncounters: {
    name: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    outcome: string;
  }[];
  questProgress: {
    questId: Types.ObjectId;
    previousStatus: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'abandoned';
    newStatus: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'abandoned';
    completedObjectives: {
      objectiveIndex: number;
      note?: string;
    }[];
    rewards?: {
      experience?: number;
      gold?: number;
      items?: string[];
      reputation?: {
        factionName: string;
        amount: number;
      }[];
      other?: string[];
    };
    dmNotes?: string;
    playerNotes?: string;
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
    transcriptions: [{ type: Schema.Types.ObjectId, ref: 'Transcription' }],
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
        questId: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Quest',
        },
        previousStatus: {
          type: String,
          required: true,
          enum: ['not_started', 'in_progress', 'completed', 'failed', 'abandoned'],
        },
        newStatus: {
          type: String,
          required: true,
          enum: ['not_started', 'in_progress', 'completed', 'failed', 'abandoned'],
        },
        completedObjectives: [
          {
            objectiveIndex: { type: Number, required: true },
            note: String,
          },
        ],
        rewards: {
          experience: Number,
          gold: Number,
          items: [String],
          reputation: [
            {
              factionName: String,
              amount: Number,
            },
          ],
          other: [String],
        },
        dmNotes: String,
        playerNotes: String,
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
