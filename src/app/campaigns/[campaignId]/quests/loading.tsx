import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function QuestsLoading() {
  return (
    <div className='p-6 space-y-6'>
      <Skeleton className='h-8 w-32' />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {[...Array(3)].map((_, columnIndex) => (
          <div key={columnIndex} className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Skeleton className='h-5 w-5' />
              <Skeleton className='h-6 w-24' />
              <Skeleton className='h-5 w-8' />
            </div>
            {[...Array(3)].map((_, cardIndex) => (
              <Card key={cardIndex}>
                <CardHeader className='p-4'>
                  <div className='flex justify-between items-start'>
                    <Skeleton className='h-6 w-40' />
                    <Skeleton className='h-5 w-16' />
                  </div>
                </CardHeader>
                <CardContent className='p-4 pt-0 space-y-4'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                  <div className='space-y-2'>
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className='h-4 w-full' />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
