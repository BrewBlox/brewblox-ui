import { QueryParams } from '@/store/history';

export const defaultPresets = (): QueryParams[] => [
  {
    duration: '10m',
  },
  {
    duration: '1h',
  },
  {
    duration: '1d',
  },
  {
    duration: '7d',
  },
  {
    duration: '14d',
  },
  {
    duration: '30d',
  },
];
