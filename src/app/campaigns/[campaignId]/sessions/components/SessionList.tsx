'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, Users, Swords, MapPin, ScrollText } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ISession } from '@/lib/models/Session';
import { Types } from 'mongoose';

type SessionWithId = Omit<ISession, keyof Document> & { _id: Types.ObjectId };

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
              {/* HEADER */}
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-semibold text-gray-900'>Session {session.sessionNumber}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
