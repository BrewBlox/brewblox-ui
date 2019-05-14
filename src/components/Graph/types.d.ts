import { DisplayNames, QueryParams, QueryTarget, GraphValueAxes } from '@/store/history/types';
import { Layout } from 'plotly.js';

export interface GraphConfig {
  layout: Partial<Layout>;
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
  axes: GraphValueAxes;
}
