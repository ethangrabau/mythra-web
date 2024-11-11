'use server';

import { Campaign, ICampaign } from '@/lib/models/Campaign';
import { revalidatePath } from 'next/cache';
import { isValidObjectId } from 'mongoose';

export async function getCampaign(campaignId: string) {
  try {
    if (!isValidObjectId(campaignId)) {
      throw new Error('Invalid campaign ID');
    }

    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return JSON.parse(JSON.stringify(campaign));
  } catch (error: any) {
    console.error('Error fetching campaign:', error.message);
    throw error;
  }
}

export async function updateCampaign(campaignId: string, data: Partial<ICampaign>) {
  try {
    const campaign = await Campaign.findByIdAndUpdate(campaignId, { $set: data }, { new: true });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    //Revalidate the campaign pages to update the UI
    revalidatePath(`/campaigns/${campaignId}`);
    revalidatePath('/campaigns');

    return JSON.parse(JSON.stringify(campaign));
  } catch (error: any) {
    console.error('Error updating campaign:', error.message);
    throw error;
  }
}

type UpdateCampaignData = Partial<Pick<ICampaign, 'name' | 'description' | 'status' | 'level'>>;

export async function updateCampaignDetails(campaignId: string, data: UpdateCampaignData) {
  return updateCampaign(campaignId, data);
}

export type CampaignStatus = ICampaign['status'];

export async function updateCampaignStatus(campaignId: string, status: CampaignStatus) {
  return updateCampaign(campaignId, { status });
}
