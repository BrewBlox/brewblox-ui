import { Layout } from 'plotly.js';

import { DisplayNames, GraphValueAxes, LineColors, QueryParams, QueryTarget } from '@/store/history';

export interface GraphConfig {
  layout: Partial<Layout>;
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
  axes: GraphValueAxes;
  colors: LineColors;
}
