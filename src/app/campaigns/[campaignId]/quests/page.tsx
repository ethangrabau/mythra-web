import { getCampaign } from '../actions';
import { notFound } from 'next/navigation';
import { QuestBoard } from './components/QuestBoard';
import { getCampaignQuests } from './actions';

type QuestPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

export default async function QuestsPage({ params: paramsPromise }: QuestPageProps) {
  const params = await paramsPromise;
  const quests = await getCampaignQuests(params.campaignId);

  if (!quests) return notFound();

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-foreground'>Quests</h2>
      </div>

      <QuestBoard
        activeQuests={quests.activeQuests}
        completedQuests={quests.completedQuests}
        failedQuests={quests.failedQuests}
      />
    </div>
  );
}
