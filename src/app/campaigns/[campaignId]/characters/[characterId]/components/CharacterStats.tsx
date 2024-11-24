import { Shield, Swords, Brain, Heart, Zap, Sparkles } from 'lucide-react';
import { StatBox } from '../../components/StatBox'; // Import StatBox from where it's defined

type CharacterStatsProps = {
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
};

export function CharacterStats({ stats }: CharacterStatsProps) {
  const getModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };

  const statConfigs = [
    { label: 'STR', value: stats.strength, icon: Swords },
    { label: 'DEX', value: stats.dexterity, icon: Zap },
    { label: 'CON', value: stats.constitution, icon: Shield },
    { label: 'INT', value: stats.intelligence, icon: Brain },
    { label: 'WIS', value: stats.wisdom, icon: Heart },
    { label: 'CHA', value: stats.charisma, icon: Sparkles },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
      {statConfigs.map(stat => (
        <StatBox
          key={stat.label}
          label={stat.label}
          value={stat.value}
          modifier={getModifier(stat.value)}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
