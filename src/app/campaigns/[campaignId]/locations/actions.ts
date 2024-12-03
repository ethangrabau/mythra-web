// /campaigns/:campaignId/locations/actions.ts
'use server';

import dbConnect from '@/lib/db';
import { Campaign, Location } from '@/lib/models';
import { isValidObjectId, Types } from 'mongoose';
import type { ILocation } from '@/lib/models/Location';
import { ICampaign } from '@/lib/models/Campaign';

type LocationWithId = Omit<ILocation, keyof Document> & {
  _id: Types.ObjectId;
};

export async function getCampaignLocations(campaignId: string) {
  try {
    if (!isValidObjectId(campaignId)) {
      throw new Error('Invalid campaign ID');
    }

    const campaign = await Campaign.findById(campaignId)
      .populate<{ locations: ILocation[] }>('locations')
      .lean<ICampaign & { locations: ILocation[] }>();

    if (!campaign) return null;

    return JSON.parse(JSON.stringify(campaign.locations));
  } catch (error: any) {
    console.log(`Error fetching campaign: ${campaignId}`);
    console.log('Error fetching campaign locations: ', error);
    throw error;
  }
}

export type { LocationWithId };
