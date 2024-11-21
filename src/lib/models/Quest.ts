import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Quest Interface
interface IQuest extends Document {
  campaignId: Types.ObjectId;
  name: string;
  description: string;
  type: 'main' | 'side' | 'character' | 'faction';
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'abandoned';
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'epic';
  giver: {
    name: string;
    type: 'npc' | 'faction' | 'item' | 'event';
    location: string;
  };
  rewards: {
    experience?: number;
    gold?: number;
    items?: string[];
    reputation?: {
      factionName: string;
      amount: number;
    }[];
    other?: string[];
  };
  objectives: {
    description: string;
    completed: boolean;
    completedAt?: Date;
    completedInSessionId?: Types.ObjectId;
    optional: boolean;
  }[];
  prerequisites?: {
    questIds?: Types.ObjectId[];
    level?: number;
    reputation?: {
      faction: string;
      minimum: number;
    }[];
    other?: string[];
  };
  relatedCharacterIds?: Types.ObjectId[]; // For character-specific quests
  timeline: {
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    failedAt?: Date;
    abandonedAt?: Date;
    deadline?: Date;
  };
  locations: {
    name: string;
    type: 'start' | 'objective' | 'end' | 'related';
    description: string;
    visited: boolean;
  }[];
  notes: {
    dm: string[]; // Private DM notes
    player: string[]; // Shared player notes
  };
  tags: string[];
}

const QuestSchema = new Schema<IQuest>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Campaign',
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['main', 'side', 'character', 'faction'],
      default: 'side',
    },
    status: {
      type: String,
      required: true,
      enum: ['not_started', 'in_progress', 'completed', 'failed', 'abandoned'],
      default: 'not_started',
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['trivial', 'easy', 'medium', 'hard', 'very_hard', 'epic'],
      default: 'medium',
    },
    giver: {
      name: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['npc', 'faction', 'item', 'event'],
      },
      location: { type: String, required: true },
    },
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
    objectives: [
      {
        description: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: Date,
        completedInSessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
        optional: { type: Boolean, default: false },
      },
    ],
    prerequisites: {
      questIds: [{ type: Schema.Types.ObjectId, ref: 'Quest' }],
      level: Number,
      reputation: [
        {
          faction: String,
          minimum: Number,
        },
      ],
      other: [String],
    },
    relatedCharacterIds: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
    timeline: {
      createdAt: { type: Date, required: true, default: Date.now },
      startedAt: Date,
      completedAt: Date,
      failedAt: Date,
      abandonedAt: Date,
      deadline: Date,
    },
    locations: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          required: true,
          enum: ['start', 'objective', 'end', 'related'],
        },
        description: String,
        visited: { type: Boolean, default: false },
      },
    ],
    notes: {
      dm: [String],
      player: [String],
    },
    tags: [String],
  },
  { timestamps: true }
);

// Create indexes for common query patterns
QuestSchema.index({ campaignId: 1, status: 1 });
QuestSchema.index({ campaignId: 1, type: 1 });
QuestSchema.index({ relatedCharacterIds: 1 });
QuestSchema.index({ tags: 1 });

// Helpful static methods for Quest model
QuestSchema.statics.findActiveQuests = function (campaignId: Types.ObjectId) {
  return this.find({
    campaignId,
    status: 'in_progress',
  }).sort('timeline.startedAt');
};

QuestSchema.statics.findCharacterQuests = function (characterId: Types.ObjectId) {
  return this.find({
    relatedCharacterIds: characterId,
  }).sort('timeline.createdAt');
};

// Method to update quest status
QuestSchema.methods.updateStatus = async function (newStatus: IQuest['status'], sessionId: Types.ObjectId) {
  const oldStatus = this.status;
  this.status = newStatus;

  // Update timeline
  if (newStatus === 'in_progress' && !this.timeline.startedAt) {
    this.timeline.startedAt = new Date();
  } else if (newStatus === 'completed') {
    this.timeline.completedAt = new Date();
  } else if (newStatus === 'failed') {
    this.timeline.failedAt = new Date();
  } else if (newStatus === 'abandoned') {
    this.timeline.abandonedAt = new Date();
  }

  // Create session record
  const session = await model('Session').findById(sessionId);
  if (session) {
    session.questProgress.push({
      questId: this._id,
      previousStatus: oldStatus,
      newStatus,
      completedObjectives: [],
      dmNotes: `Status changed from ${oldStatus} to ${newStatus}`,
    });
    await session.save();
  }

  return this.save();
};

export const Quest = mongoose.models.Quest || model<IQuest>('Quest', QuestSchema);
