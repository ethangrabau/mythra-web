import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface ISession extends Document {
  campaignId: ObjectId;
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
