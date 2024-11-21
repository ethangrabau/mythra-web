'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Shield, Swords, Brain, Heart, Zap, Sparkles } from 'lucide-react';
import type { ICharacter } from '@/lib/models/Character';
import { Types } from 'mongoose';

type CharacterWithId = {
  _id: Types.ObjectId;
} & Pick<ICharacter, Exclude<keyof ICharacter, keyof Document>>;

type CharacterGridProps = { characters: CharacterWithId[] };

export const CharacterGrid = ({ characters }: CharacterGridProps) => {
  const getModifier = (stat: number) => Math.floor((stat - 10) / 2);
  const formatModifier = (mod: number) => (mod >= 0 ? `+${mod}` : mod.toString());

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {characters.map((character: CharacterWithId) => (
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
                  <h3 className='text-2xl font-bold text-gray-900'>{character.name}</h3>
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
      ))}
    </div>
  );

  type StatBoxProps = {
    label: string;
    value: number;
    modifier: number;
    icon: React.ComponentType<{ className?: string }>;
  };

  function StatBox({ label, value, modifier, icon: Icon }: StatBoxProps) {
    return (
      <div className='flex flex-col items-center p-2 b-gray-50 rounded-lg'>
        <div className='flex items-center gap-1 text-gray-600'>
          <Icon className='h-4 w-4' />
          <span className='text-xs font-medium'>{label}</span>
        </div>
        <div className='text-lg font-bold text-gray-900'>{value}</div>
        <div className='text-sm text-gray=600'>{formatModifier(modifier)}</div>
      </div>
    );
  }
};
