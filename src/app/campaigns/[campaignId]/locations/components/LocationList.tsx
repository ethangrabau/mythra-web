'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ILocation } from '@/lib/models/Location';
import Image from 'next/image';
import Link from 'next/link';

type LocationListProps = {
  locations: ILocation[];
};

export function LocationList({ locations }: LocationListProps) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {locations.map((location: ILocation) => (
        <Link key={location._id.toString()} href={`/locations/${location._id.toString()}`}>
          <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
            <div className='flex'>
              <div className='relative w-48 min-h-[16rem] flex-shrink-0'>
                {/* Image */}
                <Image
                  src={location.imageUrl || '/placeholder-location.jpg'}
                  alt={location.name}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  onError={(e: any) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-location.jpg';
                  }}
                />
              </div>

              {/* Location Details */}
              <CardContent className='flex flex-col justify-between p-4'>
                <div>
                  {/* Header */}
                  <h3 className='text-2xl font-bold text-foreground'>{location.name}</h3>
                  <p className='text-sm text-muted-foreground'>{location.type}</p>
                </div>

                {/* Description */}
                <p className='text-gray-600 mt-2 line-clamp-3'>{location.description}</p>

                {/* Tags */}
                {location.tags && location.tags.length > 0 && (
                  <div className='flex flex-wrap gap-2 mt-4'>
                    {location.tags.map((tag, index) => (
                      <span key={index} className='bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded'>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
