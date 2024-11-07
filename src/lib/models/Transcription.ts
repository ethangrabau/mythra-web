import { Schema, model, Document, Types } from 'mongoose';

interface ITranscription extends Document {
  sessionId: Types.ObjectId;
  speakerId: Types.ObjectId; // Reference to Player (the DM)
  content: string;
  timestamp: Date; // When in the session this was spoken
  duration: number; // Length of audio in seconds
  confidence: number; // Transcription confidence score
  type: 'narration' | 'npcDialogue' | 'combat' | 'description' | 'other';
  metadata?: {
    npcName?: string; // If type is npcDialogue
    location?: string; // Current location being described
    emotions?: string[]; // Detected emotional tones
    volume?: number; // Audio volume level
    background?: {
      // Background audio detection
      music: boolean;
      ambience: boolean;
      effects: boolean;
    };
  };
  tags: string[]; // For searching/filtering specific content
  isRevised: boolean; // If the DM has edited the transcription
  originalContent?: string; // Store original transcription if revised
  audioRef?: string; // Reference to audio file storage
  segment: {
    index: number; // Order in the session
    startTime: number; // Session timestamp in seconds
    endTime: number;
  };
}

const TranscriptionSchema = new Schema<ITranscription>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Session',
    },
    speakerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Player',
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    type: {
      type: String,
      required: true,
      enum: ['narration', 'npcDialogue', 'combat', 'description', 'other'],
      default: 'narration',
    },
    metadata: {
      npcName: String,
      location: String,
      emotions: [String],
      volume: Number,
      background: {
        music: { type: Boolean, default: false },
        ambience: { type: Boolean, default: false },
        effects: { type: Boolean, default: false },
      },
    },
    tags: [String],
    isRevised: {
      type: Boolean,
      default: false,
    },
    originalContent: String,
    audioRef: String,
    segment: {
      index: {
        type: Number,
        required: true,
      },
      startTime: {
        type: Number,
        required: true,
      },
      endTime: {
        type: Number,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    // indexes: [
    //   { sessionId: 1, segment: 1 }, // For retrieving in order
    //   { sessionId: 1, timestamp: 1 },
    //   { tags: 1 }, // For searching by tags
    //   { type: 1 }, // For filtering by type
    // ],
  }
);

//This will be used to revise a transcription manually if the confidence score is low, speaker mispoke or the transcription is incorrect.
TranscriptionSchema.methods.revise = function (newContent: string) {
  if (!this.isRevised) {
    this.originalContent = this.content;
  }
  this.content = newContent;
  this.isRevised = true;
  return this.save();
};

//This method will get all transcriptions for a time range in a particular session
TranscriptionSchema.statics.getTranscriptionsForSession = function (
  sessionId: Types.ObjectId,
  startTime: number,
  endTime: number
) {
  return this.find({
    sessionId,
    'segment.startTime': { $gte: startTime },
    'segment.endTime': { $lte: endTime },
  }).sort('segment.index');
};

export const Transcription = model<ITranscription>('Transcription', TranscriptionSchema);
