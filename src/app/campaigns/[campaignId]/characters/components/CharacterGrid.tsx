'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Shield, Swords, Brain, Heart, Zap, Sparkles } from 'lucide-react';
import type { ICharacter } from '@/lib/models/Character';
import { Types } from 'mongoose';
import Link from 'next/link';
import { StatBox } from './StatBox';

type CharacterWithIdAndCampaignId = {
  _id: Types.ObjectId;
  campaignId: string;
} & Pick<ICharacter, Exclude<keyof ICharacter, keyof Document>>;

type CharacterGridProps = { characters: CharacterWithIdAndCampaignId[]; campaignId: string };

export const CharacterGrid = ({ characters, campaignId }: CharacterGridProps) => {
  const getModifier = (stat: number) => Math.floor((stat - 10) / 2);

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {characters.map((character: CharacterWithIdAndCampaignId) => (
        <Link key={character._id.toString()} href={`/campaigns/${campaignId}/characters/${character._id.toString()}`}>
          <Card key={character._id.toString()} className='overflow-hidden hover:shadow-lg transition-shadow'>
            <div className='flex'>
              <div className='relative w-48 min-h-[16rem] flex-shrink-0'>
                {/* Character Image */}
                <Image
                  src={character.imageUrl || '/placeholder-character.jpg'}
                  alt={character.name}
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                  onError={(e: any) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-character.jpg';
                  }}
                />
              </div>

              {/* Character Details */}
              <CardContent>
                <div>
                  {/* Header */}
                  <div>
                    <h3 className='text-2xl font-bold text-foreground'>{character.name}</h3>
                    <p className='text-sm text-gray-500'>
                      {character.race} {character.subrace ? `(${character.subrace})` : ''}
                    </p>
                  </div>

                  {/* Classes */}
                  <div className='flex flex-wrap gap-2'>
                    {character.class.map((cls, index) => (
                      <Badge key={index} variant='secondary' className='txt-sm'>
                        {cls.name} {cls.subclass ? `(${cls.subclass})` : ''} {cls.level}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className='grid grid-cols-3 gap-1'>
                    <StatBox
                      label='STR'
                      value={character.stats.strength}
                      modifier={getModifier(character.stats.strength)}
                      icon={Swords}
                    />
                    <StatBox
                      label='STR'
                      value={character.stats.strength}
                      modifier={getModifier(character.stats.strength)}
                      icon={Swords}
                    />
                    <StatBox
                      label='DEX'
                      value={character.stats.dexterity}
                      modifier={getModifier(character.stats.dexterity)}
                      icon={Swords}
                    />
                    <StatBox
                      label='CON'
                      value={character.stats.constitution}
                      modifier={getModifier(character.stats.constitution)}
                      icon={Swords}
                    />
                    <StatBox
                      label='INT'
                      value={character.stats.intelligence}
                      modifier={getModifier(character.stats.intelligence)}
                      icon={Swords}
                    />
                    <StatBox
                      label='WIS'
                      value={character.stats.wisdom}
                      modifier={getModifier(character.stats.wisdom)}
                      icon={Heart}
                    />
                    <StatBox
                      label='CHA'
                      value={character.stats.charisma}
                      modifier={getModifier(character.stats.charisma)}
                      icon={Sparkles}
                    />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export type { CharacterWithIdAndCampaignId };
