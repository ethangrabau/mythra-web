// /campaigns/[campaignId]/characters/[characterId]/page.tsx

import { getCharacter } from './action';
import { notFound } from 'next/navigation';

type CharacterPageProps = {
  params: Promise<{ campaignId: string; characterId: string }> | { campaignId: string; characterId: string };
};

export default async function CharacterPage({ params: paramsPromise }: CharacterPageProps) {
  const params = await paramsPromise;
  const character = await getCharacter(params.characterId);

  if (!character) return notFound();
  console.log('Character found: ');
  console.log(character);

  return <div className='max-w5xl mx-auto p-6 space-y-8>'>{character.name}</div>;
}
