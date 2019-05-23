import { DisplayNames, QueryParams, QueryTarget, GraphValueAxes } from '@/store/history';
import { Layout } from 'plotly.js';

export interface GraphConfig {
  layout: Partial<Layout>;
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
  axes: GraphValueAxes;
}
