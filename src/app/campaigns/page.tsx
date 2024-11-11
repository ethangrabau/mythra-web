import { getCampaigns } from './actions';
import CampaignGrid from './components/CampaignGrid';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className='space-y-6'>
      {/* Header section */}
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Campaigns</h1>
        <Link href='/campaigns/create'>
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {/* Grid of campaign cards */}
      <CampaignGrid campaigns={campaigns} />
    </div>
  );
}
