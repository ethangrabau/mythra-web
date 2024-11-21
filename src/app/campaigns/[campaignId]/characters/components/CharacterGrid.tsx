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
            <div className='relative w-48 h-64'>
              {/* Character Image */}
              <Image
                src={character.imageUrl || '/placeholder-character.jpg'}
                alt={character.name}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
