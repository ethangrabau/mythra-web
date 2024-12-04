type StatBoxProps = {
  label: string;
  value: number;
  modifier: number;
  icon: React.ComponentType<{ className?: string }>;
};

export function StatBox({ label, value, modifier, icon: Icon }: StatBoxProps) {
  const formatModifier = (mod: number) => (mod >= 0 ? `+${mod}` : mod.toString());

  return (
    <div className='flex flex-col items-center p-2 bg-secondary/50 rounded-lg'>
      <div className='flex items-center gap-1 text-muted-foreground'>
        <Icon className='h-4 w-4' />
        <span className='text-xs font-medium'>{label}</span>
      </div>
      <div className='text-lg font-bold text-foreground'>{value}</div>
      <div className='text-sm text-muted-foreground'>{formatModifier(modifier)}</div>
    </div>
  );
}

export type { StatBoxProps };
