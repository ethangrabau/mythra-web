'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/styleUtils';
import { Grid, Plus, Filter } from 'lucide-react';

export function CampaignNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/campaigns',
      label: 'All Campaigns',
      icon: Grid,
      exact: true,
    },
    {
      href: '/campaigns/create',
      label: 'Create Campaign',
      icon: Plus,
    },
    {
      href: '/campaigns/filtered',
      label: 'Filter Campaigns',
      icon: Filter,
    },
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
              isActive ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:bg-gray-100'
            )}>
            <Icon className='h-4 w-4' />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
