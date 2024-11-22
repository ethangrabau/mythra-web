import { getCampaign } from '../actions';
import { notFound } from 'next/navigation';
import { QuestBoard } from './components/QuestBoard';

type QuestPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

export default async function QuestsPage({ params: paramsPromise }: QuestPageProps) {
  const params = await paramsPromise;
  const campaign = await getCampaign(params.campaignId);

  if (!campaign) return notFound();
}
