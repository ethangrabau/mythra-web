'use server';

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/db';
import { Campaign } from '@/lib/models/Campaign';

export async function getCampaigns() {
  const campaigns = await Campaign.find();
  return JSON.parse(JSON.stringify(campaigns));
}

export async function createCampaign(formData: FormData) {
  const name = formData.get('name');
  const description = formData.get('description');

  await Campaign.create({ name, description });

  revalidatePath('/campaigns');
}
