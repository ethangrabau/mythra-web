// /campaigns/[campaignId]/page.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, CalendarDays, ScrollText, MapPin, Trophy, Clock } from 'lucide-react';
import { getCampaign } from './actions';
import { notFound } from 'next/navigation';
import { CampaignOverviewContent } from './components/CampaignOverviewContent';
// import { CampaignOverviewContent } from './components/CampaignOverviewContent';

type CampaignPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

// export default async function CampaignPage({ params }: { params: { campaignId: string } }) {
export default async function CampaignPage({ params: paramsPromise }: CampaignPageProps) {
  const params = await paramsPromise;
  const campaign = await getCampaign(params.campaignId);
  if (!campaign) {
    return notFound();
  }

  const stats = [
    {
      label: 'Active Players',
      value: campaign.players.filter((p: any) => p.isActive).length,
      icon: Users,
    },
    {
      label: 'Sessions Played',
      value: campaign.sessions?.pastSessions.length || 0,
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
                <div className='p-2 bg-primary/10 rounded-lg'>
                  <Icon className='h-6 w-6 text-primary' />
                </div>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>{label}</p>
                  <h3 className='text-2xl font-bold text-foreground'>{value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <CampaignOverviewContent campaign={campaign} />
    </div>
  );
}
