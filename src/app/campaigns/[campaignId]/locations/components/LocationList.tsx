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
        <Card key={location._id.toString()} className='hover:shadow-md transition-shadow m-2'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start'>
              <div className='w-48 min-h-[16rem] flex-shrink-0'>
                {/* Image */}
                <Image src={location.imageUrl || 'placeholder-character.jpg'} alt='default location' fill />
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
