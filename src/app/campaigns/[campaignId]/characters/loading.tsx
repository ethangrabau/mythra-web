import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CharactersLoading() {
  return (
    <div className='p-6'>
      <Skeleton className='h-8 w-48 mb-6' />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className='overflow-hidden'>
            <div className='flex'>
              <Skeleton className='w-48 h-64' />
              <CardContent className='flex-1 p-6'>
                <div className='space-y-4'>
                  <div>
                    <Skeleton className='h-8 w-48 mb-2' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                  <div className='flex gap-2'>
                    <Skeleton className='h-6 w-24' />
                    <Skeleton className='h-6 w-24' />
                  </div>
                  <div className='grid grid-cols-3 gap-4'>
                    {[...Array(6)].map((_, j) => (
                      <Skeleton key={j} className='h-20 w-full' />
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
