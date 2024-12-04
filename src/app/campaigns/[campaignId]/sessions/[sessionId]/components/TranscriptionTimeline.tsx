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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type TranscriptionWithId = {
  _id: Types.ObjectId;
} & Pick<ITranscription, Exclude<keyof ITranscription, keyof Document>>;

type TranscriptionTimelineProps = { transcriptions: TranscriptionWithId[] };

export const TranscriptionTimeline = ({ transcriptions }: TranscriptionTimelineProps) => {
  return (
    <Card>
      <CardTitle className='flex items-center gap-2 mb-2 mt-2'>
        <Mic className='h-5 w-5 ml-2' />
        Transcriptions
      </CardTitle>
      <CardContent>
        <Accordion type='single' collapsible className='w-full'>
          {transcriptions.map(transcription => (
            <AccordionItem key={transcription._id.toString()} value={transcription._id.toString()}>
              <AccordionTrigger className='hover:no-underline'>
                <div className='flex items-center gap-4'>
                  <Badge variant='outline'>{formatTimestamp(transcription.timestamp)}</Badge>
                  <span className='text-sm text-gray-600 text-left'>
                    {transcription.content.substring(0, 100)}
                    {transcription.content.length > 100 ? '...' : ''}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className='space-y-4 pt-2'>
                  {/* Full content */}
                  <p className='text-gray-700'>{transcription.content}</p>

                  {/* Metadata */}
                  {transcription.metadata && (
                    <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
                      {transcription.metadata.location && (
                        <div className='flex items-center gap-1'>
                          <MapPin className='h-4 w-4' />
                          <span>{transcription.metadata.location}</span>
                        </div>
                      )}
                      {transcription.metadata.emotions && (
                        <div className='flex gap-2'>
                          <span>Tone:</span>
                          {transcription.metadata.emotions.map(emotion => (
                            <Badge key={emotion} variant='outline'>
                              {emotion}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {transcription.metadata.background && (
                        <div className='flex gap-2'>
                          {transcription.metadata.background.music && <Badge variant='secondary'>Music</Badge>}
                          {transcription.metadata.background.ambience && <Badge variant='secondary'>Ambience</Badge>}
                          {transcription.metadata.background.effects && <Badge variant='secondary'>Effects</Badge>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {transcription.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {transcription.tags.map(tag => (
                        <Badge key={tag} variant='secondary' className='text-xs'>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Revision status */}
                  {transcription.isRevised && (
                    <div className='flex items-center gap-2'>
                      <Badge variant='outline' className='text-xs'>
                        Revised
                      </Badge>
                      {transcription.originalContent && (
                        <span className='text-sm text-muted-foreground'>Original: {transcription.originalContent}</span>
                      )}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
