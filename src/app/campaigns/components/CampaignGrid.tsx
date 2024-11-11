import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users } from 'lucide-react';
import Link from 'next/link';
import { D20Icon } from '@/components/icons/D20Icon';

interface Campaign {
  _id: string;
  name: string;
  description: string;
  status: string;
  level: {
    current: number;
  };
  players: Array<any>;
  nextSessionDate?: string;
  dmId: {
    displayName: string;
  };
  tags: string[];
}

export default function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-medium text-gray-900'>No campaigns yet</h3>
        <p className='mt-2 text-gray-600'>Get started by creating your first campaign!</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {campaigns.map(campaign => (
        <Link href={`/campaigns/${campaign._id}`} key={campaign._id}>
          <Card className='h-full hover:shadow-lg transition-shadow cursor-pointer'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <CardTitle className='text-xl font-bold'>{campaign.name}</CardTitle>
                <Badge
                  variant={
                    campaign.status === 'active'
                      ? 'success'
                      : campaign.status === 'planning'
                      ? 'secondary'
                      : campaign.status === 'completed'
                      ? 'default'
                      : 'destructive'
                  }>
                  {campaign.status}
                </Badge>
              </div>
              <CardDescription className='line-clamp-2'>{campaign.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Users className='h-4 w-4' />
                    <span>{campaign.players.length} players</span>
                  </div>

                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <D20Icon className='h-4 w-4' />
                    <span>Level {campaign.level.current}</span>
                  </div>
                </div>

                {campaign.nextSessionDate && (
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <CalendarDays className='h-4 w-4' />
                    <span>Next: {new Date(campaign.nextSessionDate).toLocaleDateString()}</span>
                  </div>
                )}

                <div className='flex items-center gap-2 text-sm text-gray-600'>
                  <span className='font-semibold'>DM:</span>
                  <span>{campaign.dmId.displayName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
