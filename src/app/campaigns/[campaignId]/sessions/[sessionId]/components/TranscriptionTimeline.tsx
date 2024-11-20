// /campaigns/:campaignId/sessions/:sessionId/components/TranscriptionTimeline.tsx
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MapPin } from 'lucide-react';
//import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { ITranscription } from '@/lib/models/Transcription';
import { Types } from 'mongoose';
import { formatTimestamp } from '@/lib/utils/formatTimestamp';

type TranscriptionWithId = {
  _id: Types.ObjectId;
} & Pick<ITranscription, Exclude<keyof ITranscription, keyof Document>>;

type TranscriptionTimelineProps = { transcriptions: TranscriptionWithId[] };

export const TranscriptionTimeline = ({ transcriptions }: TranscriptionTimelineProps) => {
  return (
    <Card>
      <CardTitle className='flex items-center gap-2 mb-2 mt-2'>
        <Mic className='h-5 w-5' />
        Transcriptions
      </CardTitle>
      <CardContent>
        <div className=''>
          <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200' />
          <div className='space-y-6'>
            {transcriptions.map(transcription => (
              <div key={transcription._id.toString()} className='relative pl-10'>
                <div className='absolute left-2 w-4 h-4 rounded-full bg-blue-500 -translate-x-2 mt-1.5' />
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>{formatTimestamp(transcription.timestamp)}</Badge>
                    <Badge>{transcription.type}</Badge>
                  </div>
                  <p className='text-gray-700'>{transcription.content}</p>
                  {transcription.metadata && (
                    <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                      {transcription.metadata.location && (
                        <div className='flex items-center gap-1'>
                          <MapPin className='h-4 w-4' />
                          <span>{transcription.metadata.location}</span>
                        </div>
                      )}
                      {transcription.metadata.emotions && (
                        <div className='flex gap-2'>
                          {transcription.metadata.emotions.map(emotion => (
                            <Badge key={emotion} variant='outline'>
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {transcription.tags && transcription.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {transcription.tags.map(tag => (
                        <Badge key={tag} variant='secondary' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {transcription.isRevised && (
                    <Badge variant='outline' className='text-xs'>
                      Revised
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
