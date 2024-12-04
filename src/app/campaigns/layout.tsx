// /campaigns/layout.tsx

import { Suspense } from 'react';
import { CampaignNav } from './components/CampaignNav';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CampaignLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='container mx-auto px-4 py-8'>
      <Suspense fallback={<LoadingSpinner />}>
        <CampaignNav />
      </Suspense>

      <main>{children}</main>
    </div>
  );
}
