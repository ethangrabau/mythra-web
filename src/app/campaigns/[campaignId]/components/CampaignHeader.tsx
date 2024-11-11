// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Calendar, Users, DiceD20 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CalendarDays, Users, Dice2 } from 'lucide-react';

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

export function CampaignHeader({ campaign }: CampaignHeaderProps) {}
