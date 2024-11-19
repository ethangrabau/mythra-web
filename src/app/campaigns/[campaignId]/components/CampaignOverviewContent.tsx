import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Trophy, CalendarDays, Users, ScrollText } from 'lucide-react';

interface CampaignOverviewContentProps {
  campaign: any; // Type this properly based on your campaign structure
}

export function CampaignOverviewContent({ campaign }: CampaignOverviewContentProps) {
  console.log('Here is the campaign object:');
  console.log(campaign);
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {campaign.sessions.pastSessions?.slice(0, 3).map((session: any) => (
              <div key={session._id} className='flex items-start space-x-3 p-3 bg-gray-50 rounded-lg'>
                <CalendarDays className='h-5 w-5 text-gray-500 mt-0.5' />
                <div>
                  <p className='font-medium text-gray-900'>Session {session.sessionNumber}</p>
                  <p className='text-sm text-gray-500'>{session.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Trophy className='h-5 w-5' />
            Campaign Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
              <div className='flex items-center space-x-3'>
                <div className='p-2 bg-blue-100 rounded-full'>{<Users className='h-4 w-4 text-blue-600' />}</div>
                <div>
                  <p className='font-medium text-gray-900'>Player Level</p>
                  <p className='text-sm text-gray-500'>Current: {campaign.level.current}</p>
                </div>
              </div>
              <p className='text-sm text-gray-500'>Started at level {campaign.level.start}</p>
            </div>

            {
              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-green-100 rounded-full'>
                    clgi
                    {<ScrollText className='h-4 w-4 text-green-600' />}
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>Quests Completed</p>
                    <p className='text-sm text-gray-500'>{campaign.quests.completedQuests.length} quests</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
