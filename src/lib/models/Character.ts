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
