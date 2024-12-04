'use client';

import { ButtonVar } from '@/components/ui/buttonvar';

export default function CampaignsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
      <h2 className='text-2xl font-bold text-foreground'>Something went wrong!</h2>
      <p className='text-muted-foreground'>{error.message || 'Failed to load campaigns'}</p>
      <div className='flex space-x-4'>
        <ButtonVar onClick={() => reset()}>Try again</ButtonVar>
        <ButtonVar variant='outline' onClick={() => window.location.reload()}>
          Refresh page
        </ButtonVar>
      </div>
    </div>
  );
}
