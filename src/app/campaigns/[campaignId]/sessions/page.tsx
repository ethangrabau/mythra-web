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

  return (
    <div className='p-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Campaign Sessions</h2>
          <p className='text-sm text-gray-500 mt-1'>{campaign.sessions.pastSessions.length} sessions played</p>
        </div>
      </div>

      <SessionList sessions={campaign.sessions.pastSessions} />
    </div>
  );
}
