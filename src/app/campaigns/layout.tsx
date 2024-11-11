import { Suspense } from 'react';
import { CampaignNav } from './components/CampaignNav';
// import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='container mx-auto px-4 py-8'>
      <CampaignNav />
      <main>{children}</main>
    </div>
  );
}
