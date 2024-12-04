import { Star, Heart, AlertCircle, User } from 'lucide-react';

type CharacterTraitsProps = {
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
};

export function CharacterTraits({ personalityTraits, ideals, bonds, flaws }: CharacterTraitsProps) {
  return (
    <div className='space-y-6'>
      {/* Personality Traits */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-foreground flex items-center gap-2'>
          <User className='h-4 w-4' />
          Personality Traits
        </h4>
        <ul className='space-y-2'>
          {personalityTraits.map((trait: string, index: number) => (
            <li key={index} className='text-sm text-muted-foreground pl-6 relative'>
              <span className='absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-blue-500' />
              {trait}
            </li>
          ))}
        </ul>
      </div>

      {/* Ideals */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-foreground flex items-center gap-2'>
          <Star className='h-4 w-4' />
          Ideals
        </h4>
        <ul className='space-y-2'>
          {ideals.map((ideal: string, index: number) => (
            <li key={index} className='text-sm text-muted-foreground pl-6 relative'>
              <span className='absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500' />
              {ideal}
            </li>
          ))}
        </ul>
      </div>

      {/* Bonds */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-foreground flex items-center gap-2'>
          <Heart className='h-4 w-4' />
          Bonds
        </h4>
        <ul className='space-y-2'>
          {bonds.map((bond, index) => (
            <li key={index} className='text-sm text-muted-foreground pl-6 relative'>
              <span className='absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-red-500' />
              {bond}
            </li>
          ))}
        </ul>
      </div>

      {/* Flaws */}
      <div className='space-y-2'>
        <h4 className='text-sm font-medium text-foreground flex items-center gap-2'>
          <AlertCircle className='h-4 w-4' />
          Flaws
        </h4>
        <ul className='space-y-2'>
          {flaws.map((flaw, index) => (
            <li key={index} className='text-sm text-muted-foreground pl-6 relative'>
              <span className='absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-purple-500' />
              {flaw}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
