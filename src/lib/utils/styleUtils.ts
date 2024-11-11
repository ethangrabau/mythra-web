import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

//This is a utility function that merges the Tailwind CSS classes with the clsx classes.
//It allows us to apply conflicting styles as well as conditional styles based on state.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
