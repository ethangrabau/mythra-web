import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ScrollText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Clock className='h-5 w-5 text-blue-500' />
          <h3 className='text-lg font-semibold'>Active Quests</h3>
          <Badge variant='secondary'>{activeQuests.length}</Badge>
        </div>
        <div className='space-y-4'>
          {activeQuests.map((quest: QuestWithId) => (
            <QuestCard key={quest._id.toString()} quest={quest} status='active' />
          ))}
        </div>
      </div>

      {/* Completed Quests */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <CheckCircle2 className='h-5 w-5 text-green-500' />
          <h3 className='text-lg font-semibold'>Completed</h3>
          <Badge variant='secondary'>{completedQuests.length}</Badge>
        </div>
        <div className='space-y-4'>
          {completedQuests.map(quest => (
            <QuestCard key={quest._id.toString()} quest={quest} status='completed' />
          ))}
        </div>
      </div>

      {/* Failed Quests */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <XCircle className='h-5 w-5 text-red-500' />
          <h3 className='text-lg font-semibold'>Failed</h3>
          <Badge variant='secondary'>{failedQuests.length}</Badge>
        </div>
        <div className='space-y-4'>
          {failedQuests.map(quest => (
            <QuestCard key={quest._id.toString()} quest={quest} status='failed' />
          ))}
        </div>
      </div>
    </div>
  );
}

type QuestCardProps = {
  quest: QuestWithId;
  status: 'active' | 'completed' | 'failed';
};

function QuestCard({ quest, status }: QuestCardProps) {
  const statusColors = {
    active: 'bg-blue-50 border-blue-200',
    completed: 'bg-green-50 border-green-200',
    failed: 'bg-red-50 border-red-200',
  };

  const difficultyColors = {
    trivial: 'bg-gray-100 text-gray-700',
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-orange-100 text-orange-700',
    very_hard: 'bg-red-100 text-red-700',
    epic: 'bg-purple-100 text-purple-700',
  };

  return (
    <Card className={`border-2 ${statusColors[status]}`}>
      <CardHeader className='p-4'>
        <div className='flex justify-between items-start'>
          <CardTitle className='text-lg font-semibold'>{quest.name}</CardTitle>
          <Badge variant='secondary' className={difficultyColors[quest.difficulty]}>
            {quest.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-4 pt-0 space-y-4'>
        <p className='text-sm text-gray-600'>{quest.description}</p>

        {/* Quest Giver */}
        <div className='flex items-center gap-2 text-sm text-gray-500'>
          <span className='font-medium'>From:</span>
          <span>{quest.giver.name}</span>
          <span className='text-gray-400'>•</span>
          <span>{quest.giver.location}</span>
        </div>

        {/* Objectives */}
        {quest.objectives && quest.objectives.length > 0 && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Objectives:</h4>
            <ul className='space-y-1'>
              {quest.objectives.map((objective, index) => (
                <li key={index} className='flex items-center gap-2 text-sm'>
                  <div className={`w-1.5 h-1.5 rounded-full ${objective.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span className={objective.completed ? 'line-through text-gray-500' : ''}>
                    {objective.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards (if completed) */}
        {status === 'completed' && quest.rewards && (
          <div className='space-y-2'>
            <h4 className='text-sm font-medium'>Rewards:</h4>
            <div className='flex flex-wrap gap-2'>
              {quest.rewards.gold && <Badge variant='outline'>{quest.rewards.gold} gold</Badge>}
              {quest.rewards.experience && <Badge variant='outline'>{quest.rewards.experience} XP</Badge>}
              {quest.rewards.items?.map((item, index) => (
                <Badge key={index} variant='outline'>
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
