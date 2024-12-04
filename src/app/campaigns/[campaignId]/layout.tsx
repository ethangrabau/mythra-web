// /campaigns/:campaignId/layout
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CampaignHeader } from './components/CampaignHeader';
import { CampaignTabs } from './components/CampaignTabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getCampaign } from './actions';

type CampaignLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ campaignId: string }> | { campaignId: string };
  // params: { campaignId: string };
};

interface CampaignData {
  _id: string;
  name: string;
  status: string;
  players: Array<any>; // Update when Player is ready
  level: {
    current: number;
  };
  nextSessionDate?: string;
  dmId: {
    displayName: string;
  };
}

export default async function CampaignLayout({ children, params: paramsPromise }: CampaignLayoutProps) {
  // export default async function CampaignLayout({ children, params }: CampaignLayoutProps) {
  const params = await paramsPromise;
  if (!params?.campaignId) {
    return notFound();
  }

  let campaign;

  try {
    const data = await getCampaign(params.campaignId);
    campaign = data as CampaignData;

    if (!campaign) return notFound();
  } catch (error) {
    return notFound();
  }

  return (
    <div className='space-y-1 p-6'>
      <Suspense fallback={<LoadingSpinner />}>
        <CampaignHeader campaign={campaign} />
      </Suspense>

      <CampaignTabs />

      <div className='bg-primary rounded-lg shadow'>{children}</div>
    </div>
  );
}
