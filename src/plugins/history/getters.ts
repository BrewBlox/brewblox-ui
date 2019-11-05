import { QueryParams } from '@/store/history';

import { GraphConfig } from './types';

export const defaultPresets = (): QueryParams[] => [
  { duration: '10m' },
  { duration: '1h' },
  { duration: '1d' },
  { duration: '7d' },
  { duration: '14d' },
  { duration: '30d' },
];

export const emptyGraphConfig = (): GraphConfig => ({
  layout: {},
  params: {},
  targets: [],
  renames: {},
  axes: {},
  colors: {},
});
