// /campaigns/[campaignId]/sessions/page.tsx
import { getCampaign } from '../actions';
import { notFound } from 'next/navigation';

type SessionPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

export default async function SessionPage({ params: paramsPromise }: SessionPageProps) {
  const params = await paramsPromise;
  const campaign = await getCampaign(params.campaignId);
  if (!campaign) {
    return notFound();
  }

  return (
    <div>
      <h1>Sessions</h1>
    </div>
  );
}
