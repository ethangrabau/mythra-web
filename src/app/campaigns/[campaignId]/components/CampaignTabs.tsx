'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils/styleUtils';
import { LayoutDashboard, CalendarDays, Users, ScrollText, MapPin, MessageSquare } from 'lucide-react';

// export function CampaignTabs({ campaignId }: { campaignId: string }) {
export function CampaignTabs() {
  const pathname = usePathname();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const tabs = [
    { href: `/campaigns/${campaignId}`, label: 'Overview', exact: true, icon: LayoutDashboard },
    { href: `/campaigns/${campaignId}/sessions`, label: 'Sessions', icon: CalendarDays },
    { href: `/campaigns/${campaignId}/characters`, label: 'Characters', icon: Users },
    { href: `/campaigns/${campaignId}/quests`, label: 'Quests', icon: ScrollText },
    { href: `/campaigns/${campaignId}/locations`, label: 'Locations', icon: MapPin },
    { href: `/campaigns/${campaignId}/notes`, label: 'Notes', icon: MessageSquare },
  ];

  return (
    <nav className='border-b border-gray-200'>
      <div className='flex space-x-8'>
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium',
                'transition-colors hover:text-gray-900',
                isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300'
              )}>
              <Icon className='h-4 w-4' />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
