// /campaigns/[campaignId]/characters/[characterId]/page.tsx

import { getCharacter } from './action';
import { notFound } from 'next/navigation';
import { CharacterWithId } from './action';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      {/* Top Section - Character Overview */}
      <div className='flex flex-col md:flex-row gap-6'>
        {/* Left - Image */}
        <div className='w-full md:w-1/4'>
          <div className='relative aspect-[3/4] w-full rounded-lg overflow-hidden shadow-lg'>
            <Image
              src={character.imageUrl || '/placeholder-character.jpg'}
              alt={character.name}
              fill
              className='object-cover'
            />
          </div>
        </div>

        {/* Right - Basic Info */}
        <div className='w-full md:w-3/4'>
          <div className='space-y-4'>
            <div>
              <h1 className='text-3xl font-bold text-foreground mb-2'>{character.name}</h1>
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
              <p className='text-muted-foreground'>{character.background}</p>
            </div>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Experience</p>
                    <p className='text-2xl font-bold'>{character.experience.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Total Level</p>
                    <p className='text-2xl font-bold text-center'>
                      {character.class.reduce((sum: number, cls: any) => sum + cls.level, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue='stats' className='w-full'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='stats' className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            Stats
          </TabsTrigger>
          <TabsTrigger value='personality' className='flex items-center gap-2'>
            <User className='h-4 w-4' />
            Personality
          </TabsTrigger>
          <TabsTrigger value='inventory' className='flex items-center gap-2'>
            <Backpack className='h-4 w-4' />
            Inventory
          </TabsTrigger>
          <TabsTrigger value='background' className='flex items-center gap-2'>
            {/* <History className='h-4 w-4' /> */}
            Background
          </TabsTrigger>
          <TabsTrigger value='notes' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            Notes
          </TabsTrigger>
        </TabsList>

        <div className='mt-6'>
          <TabsContent value='stats'>
            <Card>
              <CardContent className='p-6'>
                <CharacterStats stats={character.stats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='personality'>
            <Card>
              <CardContent className='p-6'>
                <CharacterTraits
                  personalityTraits={character.personalityTraits}
                  ideals={character.ideals}
                  bonds={character.bonds}
                  flaws={character.flaws}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='inventory'>
            <Card>
              <CardContent className='p-6'>
                <CharacterInventory inventory={character.inventory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='background'>
            <Card>
              <CardContent className='p-6 space-y-4'>
                <div>
                  <h3 className='font-medium text-foreground mb-2'>Background</h3>
                  <p className='text-muted-foreground'>{character.background}</p>
                </div>
                {/* Add more background-related information here */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='notes'>
            <Card>
              <CardContent className='p-6'>
                <p className='text-muted-foreground whitespace-pre-wrap'>{character.notes || 'No notes recorded.'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
