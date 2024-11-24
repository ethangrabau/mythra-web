// /campaigns/[camaignId]/sessions/actions.ts
'use server';

import { isValidObjectId } from 'mongoose';
import { Session, Transcription, Player, Character, Quest } from '@/lib/models';

export async function getSession(sessionId: string) {
  try {
    if (!isValidObjectId(sessionId)) {
      throw new Error('Invalid session ID');
    }

    const session = await Session.findById(sessionId)
      .populate({
        path: 'transcriptions',
        options: { sort: { timestamp: 1 } },
      })
      .populate('campaignId')
      .populate('attendance.playerId', 'username email')
      .populate('attendance.characterId', 'name class race')
      .populate('lootAwarded.characterId')
      .populate('characterUpdates.characterId')
      .populate('questProgress.questId')
      .lean();

    if (!session) {
      throw new Error('Session not found');
    }
    return JSON.parse(JSON.stringify(session));
  } catch (error: any) {
    console.error('Error fetching session:', error.message);
    throw error;
  }
}
