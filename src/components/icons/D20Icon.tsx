export function D20Icon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}>
      <path d='M12 2L2 8.5l10 6.5 10-6.5L12 2z' />
      <path d='M2 8.5v7L12 22l10-6.5v-7' />
      <path d='M12 8.5L2 15.5M12 8.5l10 7' />
    </svg>
  );
}
