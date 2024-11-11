import dbConnect from '@/lib/db';
import { Campaign } from '@/lib/models/Campaign';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const campaigns = await Campaign.find({});
    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
