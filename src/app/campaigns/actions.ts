'use server';

import { revalidatePath } from 'next/cache';
import '../../lib/models/Player';
import { Campaign } from '@/lib/models/Campaign';

export async function getCampaigns() {
  const campaigns = await Campaign.find().populate('dmId').lean();
  return JSON.parse(JSON.stringify(campaigns));
}

export async function createCampaign(formData: FormData) {
  const name = formData.get('name');
  const description = formData.get('description');

  await Campaign.create({ name, description });

  revalidatePath('/campaigns');
}
