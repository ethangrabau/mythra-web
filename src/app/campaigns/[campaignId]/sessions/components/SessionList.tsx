'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, Users, Swords, MapPin, ScrollText } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ISession } from '@/lib/models/Session';
import { Types, Document } from 'mongoose';

type SessionWithId = {
  _id: Types.ObjectId;
} & Pick<ISession, Exclude<keyof ISession, keyof Document>>;

type SessionListProps = {
  sessions: SessionWithId[];
};

export function SessionList({ sessions }: SessionListProps) {
  return (
    <div className='space-y-4'>
      {sessions.map((session: SessionWithId) => (
        <Card key={session._id.toString()} className='hover:shadow-md transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex justify-between items-start'>
              <div className='space-y-4 flex-1'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-semibold text-gray-900'>Session {session.sessionNumber}</h3>
                  <span className='text-sm text-gray-500'>
                    {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                  </span>
                </div>

                {/* Summary */}
                <p className='text-gray-600'>{session.summary}</p>

                {/* Stats Grid */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4'>
                  {/* Duration STILL NEEDS ADDED TO MODEL */}
                  {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className='h-4 w-4' />
                    <span>{session.duration}</span>
                  </div> */}

                  {/* Location */}
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <MapPin className='h-4 w-4' />
                    <span>{session.location.isVirtual ? `${session.location.platform}` : session.location.name}</span>
                  </div>

                  {/* Attendance */}
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Users className='h-4 w-4' />
                    <span>{session.attendance.filter(a => a.present).length} players</span>
                  </div>

                  {/* Combat Encounters */}
                  <div className='flex items-center gap-2 text-sm text-gray-600'>
                    <Swords className='h-4 w-4' />
                    <span>{session.combatEncounters.length} encounters</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
