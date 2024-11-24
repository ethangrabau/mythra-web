// /campaigns/[campaignId]/characters/[characterId]/page.tsx

import { getCharacter } from './action';
import { notFound } from 'next/navigation';
import { CharacterWithId } from './action';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Swords,
  Brain,
  Heart,
  Zap,
  Sparkles,
  Scroll,
  User,
  Backpack,
  FileText,
  Star,
  AlertCircle,
} from 'lucide-react';
import { StatBox } from '../components/StatBox';
import { CharacterStats } from './components/CharacterStats';
import { CharacterInventory } from './components/CharacterInventory';
import { CharacterTraits } from './components/CharacterTraits';

type CharacterPageProps = {
  params: Promise<{ campaignId: string; characterId: string }> | { campaignId: string; characterId: string };
};

export default async function CharacterPage({ params: paramsPromise }: CharacterPageProps) {
  const params = await paramsPromise;
  const character = await getCharacter(params.characterId);

  if (!character) return notFound();

  return (
    <div className='p-6 space-y-6 max-w-7xl mx-auto'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column - Image and Ability Scores */}
        <div className='space-y-6'>
          {/* Character Image */}
          <div className='relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-lg'>
            <Image
              src={character.imageUrl || '/placeholder-character.jpg'}
              alt={character.name}
              fill
              className='object-cover'
            />
          </div>

          {/* Ability Scores Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                Ability Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CharacterStats stats={character.stats} />
            </CardContent>
          </Card>
        </div>

        {/* Middle and Right Columns - Character Info and Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Character Header Info */}
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>{character.name}</h1>
            <div className='flex flex-wrap gap-2 mb-4'>
              <Badge variant='outline'>
                {character.race} {character.subrace ? `(${character.subrace})` : ''}
              </Badge>
              {character.class.map((cls: any, index: number) => (
                <Badge key={index} variant='secondary'>
                  {cls.name} {cls.subclass ? `(${cls.subclass})` : ''} {cls.level}
                </Badge>
              ))}
              <Badge>{character.alignment}</Badge>
            </div>
            <p className='text-gray-600'>{character.background}</p>
          </div>

          {/* Experience Card */}
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-500'>Experience</p>
                  <p className='text-2xl font-bold'>{character.experience.toLocaleString()}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Total Level</p>
                  <p className='text-2xl font-bold text-center'>
                    {character.class.reduce((sum: number, cls: any) => sum + cls.level, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personality Card */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5' />
                Personality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CharacterTraits
                personalityTraits={character.personalityTraits}
                ideals={character.ideals}
                bonds={character.bonds}
                flaws={character.flaws}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row - Inventory and Notes */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Backpack className='h-5 w-5' />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CharacterInventory inventory={character.inventory} />
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-gray-600 whitespace-pre-wrap'>{character.notes || 'No notes recorded.'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
