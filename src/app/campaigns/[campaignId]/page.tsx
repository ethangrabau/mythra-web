import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, CalendarDays, ScrollText, MapPin, Trophy, Clock } from 'lucide-react';
import { getCampaign } from './actions';

export default async function CampaignPage({ params }: { params: { campaignId: string } }) {
  const campaign = await getCampaign(params.campaignId);

  const stats = [
    {
      label: 'Active Players',
      value: campaign.players.filter((p: any) => p.isActive).length,
      icon: Users,
    },
    {
      label: 'Sessions Played',
      value: campaign.sessions?.length || 0,
      icon: CalendarDays,
    },
    {
      label: 'Active Quests',
      value: campaign.quests.activeQuests.length,
      icon: ScrollText,
    },
    {
      label: 'Locations Discovered',
      value: campaign.locations?.length || 0,
      icon: MapPin,
    },
  ];

  return (
    <div className='p-6 space-y-6'>
      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-4'>
                <div className='p-2 bg-blue-50 rounded-lg'>
                  <Icon className='h-6 w-6 text-blue-500' />
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>{label}</p>
                  <h3 className='text-2xl font-bold text-gray-900'>{value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Next Session */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='h-5 w-5' />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {campaign.sessions?.slice(0, 3).map((session: any) => (
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
                  <div className='p-2 bg-blue-100 rounded-full'>
                    <Users className='h-4 w-4 text-blue-600' />
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>Player Level</p>
                    <p className='text-sm text-gray-500'>Current: {campaign.level.current}</p>
                  </div>
                </div>
                <p className='text-sm text-gray-500'>Started at level {campaign.level.start}</p>
              </div>

              <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                <div className='flex items-center space-x-3'>
                  <div className='p-2 bg-green-100 rounded-full'>
                    <ScrollText className='h-4 w-4 text-green-600' />
                  </div>
                  <div>
                    <p className='font-medium text-gray-900'>Quests Completed</p>
                    <p className='text-sm text-gray-500'>{campaign.quests.completedQuests.length} quests</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
