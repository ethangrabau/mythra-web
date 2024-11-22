import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ScrollText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { IQuest } from '@/lib/models/Quest';
import { Types } from 'mongoose';

type QuestWithId = Omit<IQuest, keyof Document> & { _id: Types.ObjectId };

type QuestBoardProps = {
  activeQuests: QuestWithId[];
  completedQuests: QuestWithId[];
  failedQuests: QuestWithId[];
};

export function QuestBoard({ activeQuests, completedQuests, failedQuests }: QuestBoardProps) {
  return (
    <div>
      {/* Active Quests*/}
      <div className='space-y-4'>Active Quests Go Here</div>
      {/* Completed Quests*/}
      <div className='space-y-4'>Completed Quests Go Here</div>
      {/* Failed Quests*/}
      <div className='space-y-4'>Failed Quests Go Here</div>
    </div>
  );
}
