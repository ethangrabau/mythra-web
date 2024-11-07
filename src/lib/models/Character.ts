import { Schema, model, Document, Types } from 'mongoose';

// Character Interface
interface ICharacter extends Document {
  playerId: Types.ObjectId;
  name: string;
  class: {
    name: string;
    level: number;
    subclass?: string;
  }[]; // Array for multiclassing
  race: string;
  subrace?: string;
  background: string;
  alignment: string;
  experience: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  currentCampaignId?: Types.ObjectId;
  isAlive: boolean;
  personalityTraits: string[];
  bonds: string[];
  ideals: string[];
  flaws: string[];
  inventory: {
    item: string;
    quantity: number;
    equipped: boolean;
    attuned: boolean;
  }[];
  notes: string;
}

//Schema
const CharacterSchema = new Schema<ICharacter>(
  {
    playerId: { type: Schema.Types.ObjectId, required: true, ref: 'Player' },
    name: { type: String, required: true },
    class: [
      {
        name: {
          type: String,
          required: true,
          enum: [
            'Barbarian',
            'Bard',
            'Cleric',
            'Druid',
            'Fighter',
            'Monk',
            'Paladin',
            'Ranger',
            'Rogue',
            'Sorcerer',
            'Warlock',
            'Wizard',
          ],
        },
        level: { type: Number, required: true, min: 1, max: 20 },
        subclass: String,
      },
    ],
    race: { type: String, required: true },
    subrace: String,
    background: { type: String, required: true },
    alignment: {
      type: String,
      required: true,
      enum: ['LG', 'NG', 'CG', 'LN', 'N', 'CN', 'LE', 'NE', 'CE'],
    },
    experience: { type: Number, default: 0 },
    stats: {
      strength: { type: Number, required: true, min: 1, max: 30 },
      dexterity: { type: Number, required: true, min: 1, max: 30 },
      constitution: { type: Number, required: true, min: 1, max: 30 },
      intelligence: { type: Number, required: true, min: 1, max: 30 },
      wisdom: { type: Number, required: true, min: 1, max: 30 },
      charisma: { type: Number, required: true, min: 1, max: 30 },
    },
    currentCampaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    isAlive: { type: Boolean, default: true },
    personalityTraits: [String],
    bonds: [String],
    ideals: [String],
    flaws: [String],
    inventory: [
      {
        item: String,
        quantity: { type: Number, default: 1 },
        equipped: { type: Boolean, default: false },
        attuned: { type: Boolean, default: false },
      },
    ],
    notes: String,
  },
  { timestamps: true }
);
