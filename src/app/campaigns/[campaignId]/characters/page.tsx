import { getCampaignCharacters } from './actions';
import { notFound } from 'next/navigation';
import { CharacterGrid } from './components/CharacterGrid';

type CharacterPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

export default async function CharacterPage({ params: paramsPromise }: CharacterPageProps) {
  const params = await paramsPromise;
  const characters = await getCampaignCharacters(params.campaignId);

  if (!characters) return notFound();

  return (
    <div className='p-2 bg-background'>
      {/* <h2 className='text-2xl font-bold text-foreground mb-6'>Party Members</h2> */}
      <CharacterGrid characters={characters} campaignId={params.campaignId} />
    </div>
  );
}
