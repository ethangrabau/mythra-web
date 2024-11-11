'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/styleUtils';

export function CampaignTabs({ campaignId }: { campaignId: string }) {
  const pathname = usePathname();

  const tabs = [
    { href: `/campaigns/${campaignId}`, label: 'Overview', exact: true },
    { href: `/campaigns/${campaignId}/sessions`, label: 'Sessions' },
    { href: `/campaigns/${campaignId}/characters`, label: 'Characters' },
    { href: `/campaigns/${campaignId}/quests`, label: 'Quests' },
    { href: `/campaigns/${campaignId}/notes`, label: 'Notes' },
  ];

  return (
    <nav className='border-b border-gray-200'>
      <div className='flex space-x-8'>
        {tabs.map(({ href, label, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'py-4 px-1 border-b-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
              )}>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
