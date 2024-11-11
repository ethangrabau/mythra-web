'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, List } from 'lucide-react';
import { cn } from '@/lib/utils/styleUtils';

export function CampaignNav() {
  const pathname = usePathname();

  const links = [
    { href: '/campaigns', label: 'All Campaigns', icon: List, exact: true },
    { href: '/campaigns/create', label: 'Create Campaign', icon: Plus },
  ];

  return (
    <nav className='flex items-center space-x-4 mb-8'>
      {links.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}>
            <Icon className='h-4 w-4' />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
