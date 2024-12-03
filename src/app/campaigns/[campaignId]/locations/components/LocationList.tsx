'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ILocation } from '@/lib/models/Location';
import { LocationWithId } from '../actions';
import Image from 'next/image';

type LocationListProps = {
  locations: ILocation[];
};

export function LocationList({ locations }: LocationListProps) {
  return (
    <div className='space-y-4'>
      {locations.map((location: ILocation) => (
        <Card key={location._id.toString()} className='overflow-hidden hover:shadow-md transition-shadow m-2'>
          <CardContent className='p-6'>
            {/* <div className='flex justify-between items-start'> */}
            <div className='flex'>
              <div className='relative w-48 min-h-[16rem] flex-shrink-0'>
                {/* Image */}
                <Image
                  src={location.imageUrl || 'placeholder-character.jpg'}
                  alt='default location'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                />
              </div>
              <div className='space-y-4 flex-1'>
                {/* Description */}
                <p className='text-gray-600'>{location.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
