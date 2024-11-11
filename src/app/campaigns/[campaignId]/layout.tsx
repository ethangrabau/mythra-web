// /campaigns/:campaignId/layout
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CampaignHeader } from './components/CampaignHeader';
import { CampaignTabs } from './components/CampaignTabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getCampaign } from './actions';

type CampaignLayoutProps = {
  children: React.ReactNode;
  params: { campaignId: string };
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

export default async function CampaignLayout({ children, params }: CampaignLayoutProps) {
  let campaign;

  try {
    const data = await getCampaign(params.campaignId);
    campaign = data as CampaignData;
  } catch (error) {
    return notFound();
  }

  return (
    <div className='space-y-6'>
      <Suspense fallback={<LoadingSpinner />}>
        <CampaignHeader campaign={campaign} />
      </Suspense>

      <CampaignTabs campaignId={params.campaignId} />

      <div className='bg-white rounded-lg shadow'>{children}</div>
    </div>
  );
}
