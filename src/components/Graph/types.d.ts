import { Layout } from 'plotly.js';

import { DisplayNames, GraphValueAxes,QueryParams, QueryTarget } from '@/store/history';

export interface GraphConfig {
  layout: Partial<Layout>;
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
  axes: GraphValueAxes;
}
