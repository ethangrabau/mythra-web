'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, Users, Swords, MapPin, ScrollText } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ISession } from '@/lib/models/Session';
import { Types, Document } from 'mongoose';
import Link from 'next/link';

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
        <Link key={session._id.toString()} href={`/campaigns/${session.campaignId}/sessions/${session._id}`}>
          <Card key={session._id.toString()} className='hover:shadow-md transition-shadow m-2'>
            <CardContent className='p-6'>
              <div className='flex justify-between items-start'>
                <div className='space-y-4 flex-1'>
                  {/* Header */}
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xl font-semibold text-foreground'>Session {session.sessionNumber}</h3>
                    <span className='text-sm text-muted-foreground'>
                      {formatDistanceToNow(new Date(session.date), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className='text-muted-foreground'>{session.summary}</p>

                  {/* Stats Grid */}
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 pt-4'>
                    {/* Duration STILL NEEDS ADDED TO MODEL */}
                    {/* <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className='h-4 w-4' />
                    <span>{session.duration}</span>
                  </div> */}

                    {/* Location */}
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <MapPin className='h-4 w-4' />
                      <span>{session.location.isVirtual ? `${session.location.platform}` : session.location.name}</span>
                    </div>

                    {/* Attendance */}
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Users className='h-4 w-4' />
                      <span>{session.attendance.filter(a => a.present).length} players</span>
                    </div>

                    {/* Combat Encounters */}
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Swords className='h-4 w-4' />
                      <span>{session.combatEncounters.length} encounters</span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className='pt-4 space-y-3'>
                    {/* Combat Encounters */}
                    {session.combatEncounters.length > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium text-foreground'>Combat Encounters</h4>
                        <div className='space-y-1'>
                          {session.combatEncounters.map((encounter, index) => (
                            <div key={index} className='text-sm text-muted-foreground flex items-center gap-2'>
                              <span className='w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-xs'>
                                {index + 1}
                              </span>
                              <span>
                                {encounter.name} - {encounter.outcome}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Locations Visited */}
                    {session.importantLocations.length > 0 && (
                      <div className='space-y-2'>
                        <h4 className='text-sm font-medium text-foreground'>Locations Visited:</h4>
                        <div className='flex flex-wrap gap-2'>
                          {session.importantLocations.map(location => (
                            <span
                              key={location}
                              className='px-2 py-1 bg-gray-100 rounded-full text-xs text-muted-foreground'>
                              {location}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
