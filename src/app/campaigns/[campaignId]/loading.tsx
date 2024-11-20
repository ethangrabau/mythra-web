// /campaigns/:campaignId/loading.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CampaignLoading() {
  return (
    <div className='p-6 space-y-6'>
      {/* Stats Grid Loading */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-4'>
                <Skeleton className='h-12 w-12 rounded-lg' />
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-6 w-16' />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Milestones Loading */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className='h-6 w-48' />
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className='h-6 w-48' />
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
