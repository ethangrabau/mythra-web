// /campaigns/[campaignId]/sessions/[sessionId]/page.tsx

import { getSession } from '../actions';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Users, CalendarDays, Clock, MapPin, Swords, Scroll, User, Trophy, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ButtonVar } from '@/components/ui/buttonvar';
import Link from 'next/link';
import { TranscriptionTimeline } from './components/TranscriptionTimeline';
import type { ITranscription } from '@/lib/models/Transcription';

type SessionPageProps = {
  params:
    | Promise<{ campaignId: string; sessionId: string }>
    | {
        campaignId: string;
        sessionId: string;
      };
};

export default async function SessionPage({ params: paramsPromise }: SessionPageProps) {
  const params = await paramsPromise;
  const session = await getSession(params.sessionId);

  if (!session) return notFound();

  return (
    <div className='p-6 space-y-8 bg-background'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold text-foreground'>Session {session.sessionNumber}</h1>
            <Badge variant='secondary'>{format(new Date(session.date), 'PPP')}</Badge>
          </div>
          <p className='mt-2 text-muted-foreground'>{session.summary}</p>
        </div>
        <Link href={`/campaigns/${params.campaignId}/sessions`}>
          <ButtonVar variant='outline'>Back to Sessions</ButtonVar>
        </Link>
      </div>

      {/* Transcription Timeline */}
      {session.transcriptions && session.transcriptions.length > 0 && (
        <TranscriptionTimeline transcriptions={session.transcriptions} />
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>{session.duration / 60} hours</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                {session.location.isVirtual ? `${session.location.platform}` : session.location.name}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>
                {session.attendance.filter((a: any) => a.present).length} players
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2'>
              <Swords className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>{session.combatEncounters.length} encounters</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Combat Encounters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Swords className='h-5 w-5' />
              Combat Encounters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {session.combatEncounters.map((encounter: any, index: any) => (
                <div key={index} className='p-4 bg-secondary/50 rounded-lg'>
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-medium text-foreground'>{encounter.name}</h4>
                    <Badge>{encounter.difficulty}</Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>{encounter.outcome}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* NPCs Introduced */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              NPCs Introduced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {session.npcsIntroduced.map((npc: any, index: any) => (
                <div key={index} className='p-4 bg-secondary/50 rounded-lg'>
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-medium text-foreground'>{npc.name}</h4>
                    <Badge variant={npc.isAlive ? 'success' : 'destructive'}>
                      {npc.isAlive ? 'Alive' : 'Deceased'}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground mb-2'>{npc.description}</p>
                  <p className='text-sm text-muted-foreground'>
                    <MapPin className='h-3 w-3 inline mr-1' />
                    {npc.location}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loot Awarded */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5' />
              Loot Awarded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {session.lootAwarded.map((loot: any, index: any) => (
                <div key={index} className='p-4 bg-secondary/50 rounded-lg flex justify-between items-center'>
                  <div>
                    <h4 className='font-medium text-foreground'>{loot.item}</h4>
                    <p className='text-sm text-muted-foreground'>Quantity: {loot.quantity}</p>
                  </div>
                  {loot.value && <Badge variant='outline'>{loot.value} gp</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <MessageSquare className='h-5 w-5' />
              Session Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='p-4 bg-secondary/50 rounded-lg'>
                <h4 className='font-medium text-foreground mb-2'>Public Notes</h4>
                <p className='text-sm text-muted-foreground'>{session.notes.public}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
