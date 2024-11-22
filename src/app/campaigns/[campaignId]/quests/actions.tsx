'use server';
import { Campaign } from '@/lib/models';
import { isValidObjectId } from 'mongoose';
import type { IQuest } from '@/lib/models/Quest';
import { Types } from 'mongoose';

type QuestWithId = Omit<IQuest, keyof Document> & {
  _id: Types.ObjectId;
};

type PopulatedCampaignQuests = {
  quests: {
    mainQuests: QuestWithId[];
    activeQuests: QuestWithId[];
    completedQuests: QuestWithId[];
    failedQuests: QuestWithId[];
  };
};

export async function getCampaignQuests(campaignId: string) {
  try {
    if (!isValidObjectId(campaignId)) {
      throw new Error('Invalid campaign id');
    }

    const campaign = await Campaign.findById(campaignId)
      .select('quests')
      .populate('quests.mainQuests')
      .populate('quests.activeQuests')
      .populate('quests.completedQuests')
      .populate('quests.failedQuests')
      .lean();

    if (!campaign) {
      return null;
    }

    const typedCampaign = campaign as unknown as PopulatedCampaignQuests;

    return {
      activeQuests: typedCampaign.quests.activeQuests as QuestWithId[],
      completedQuests: typedCampaign.quests.completedQuests as QuestWithId[],
      failedQuests: typedCampaign.quests.failedQuests as QuestWithId[],
    };
  } catch (error: any) {
    console.log('Error fetching campaign quests', error);
    throw error;
  }
}

//Export types for use in other components
export type { QuestWithId };
