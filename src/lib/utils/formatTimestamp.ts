//Helper function to safely format a date/timestamp
import { format, isValid } from 'date-fns';

export const formatTimestamp = (timestamp: Date | string): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  if (!isValid(date)) return 'Invalid Date/Time';

  return format(date, 'HH:mm:ss');
};
