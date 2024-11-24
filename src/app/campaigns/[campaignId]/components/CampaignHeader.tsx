import { D20Icon } from '@/components/icons/D20Icon';
import { Badge } from '@/components/ui/badge';
import { ButtonVar } from '@/components/ui/buttonvar';
import { CalendarDays, Users } from 'lucide-react';

type CampaignHeaderProps = {
  campaign: {
    name: string;
    status: string;
    players: any[];
    level: {
      current: number;
    };
    nextSessionDate?: string;
    dmId: {
      displayName: string;
    };
  };
};

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'planning':
        return 'secondary';
      case 'completed':
        return 'default';
      case 'hiatus':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className='bg-white rounded-lg shadow p-2'>
      <div className='flex justify-between items-start'>
        <div>
          <div className='flex items-center gap-4'>
            <h2 className='text-2xl font-bold'>{campaign.name}</h2>
            <Badge variant={getBadgeVariant(campaign.status)}>{campaign.status}</Badge>
            <div className='mt-0 flex items-center gap-6 text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                <span>{campaign.players.length} players</span>
              </div>

              <div className='flex items-center gap-2'>
                <D20Icon className='h-4 w-4' />
                <span>Level {campaign.level.current}</span>
              </div>

              {campaign.nextSessionDate && (
                <div className='flex items-center gap-2'>
                  <CalendarDays className='h-4 w-4' />
                  <span>Next: {new Date(campaign.nextSessionDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-3'>
          <ButtonVar variant='outline'>Edit Campaign</ButtonVar>
          <ButtonVar>Schedule Session</ButtonVar>
        </div>
      </div>
    </div>
  );
}
