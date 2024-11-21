'use server';

import dbConnect from '@/lib/db';
import { Campaign, Character } from '@/lib/models';
import { isValidObjectId, Types } from 'mongoose';
import type { ICharacter } from '@/lib/models/Character';

// Define types for the populated data structure
type PopulatedPlayer = {
  playerId: Types.ObjectId;
  characterId: ICharacter & { _id: Types.ObjectId };
  isActive: boolean;
};

type PopulatedCampaignResult = {
  _id: Types.ObjectId;
  players: PopulatedPlayer[];
};

export async function getCampaignCharacters(campaignId: string) {
  try {
    if (!isValidObjectId(campaignId)) {
      throw new Error('Invalid campaign ID');
    }

    await dbConnect();

    const campaign = await Campaign.findById(campaignId)
      .select('players')
      .populate({
        path: 'players.characterId',
        model: 'Character',
        select: 'name class race subrace level imageUrl stats',
      })
      .lean();

    if (!campaign) {
      return null;
    }

    // Type assertion after we know we have data
    const typedCampaign = campaign as unknown as PopulatedCampaignResult;

    const characters = typedCampaign.players.filter(player => player.isActive).map(player => player.characterId);
    console.log('populated characters: ', characters);

    return JSON.parse(JSON.stringify(characters));
  } catch (error) {
    console.error('Error fetching campaign characters:', error);
    throw error;
  }
}

// Export the types for use in other files
export type { PopulatedCampaignResult as PopulatedCampaign };
