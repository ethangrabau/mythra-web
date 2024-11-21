// /campaigns/[campaignId]/sessions/page.tsx
import { getCampaign } from '../actions';
import { notFound } from 'next/navigation';
import { SessionList } from './components/SessionList';

type SessionPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

export default async function SessionPage({ params: paramsPromise }: SessionPageProps) {
  const params = await paramsPromise;
  const campaign = await getCampaign(params.campaignId);
  if (!campaign) {
    return notFound();
  }

  // Sort sessions by date in descending order (newest first)
  const sortedSessions = [...campaign.sessions.pastSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>{campaign.name} Sessions</h2>
          <p className='text-sm text-gray-500 mt-1'>{campaign.sessions.pastSessions.length} sessions played</p>
        </div>
      </div>

      <SessionList sessions={sortedSessions} />
    </div>
  );
}
