import { QueryParams, QueryTarget, DisplayNames } from '@/plugins/history/state';
import { Layout } from 'plotly.js';

export interface GraphConfig {
  serviceId: string;
  layout: Partial<Layout>;
  params: QueryParams;
  targets: QueryTarget[];
  renames?: DisplayNames;
}
