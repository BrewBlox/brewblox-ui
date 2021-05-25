import { MetricsConfig } from './types';

export const emptyMetricsConfig = (): MetricsConfig => ({
  targets: [],
  renames: {},
  params: {},
  freshDuration: {},
  decimals: {},
});
