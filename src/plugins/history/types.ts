import { Layout } from 'plotly.js';

import { GraphValueAxes, LineColors, QueryConfig } from '@/store/history';


export interface GraphConfig extends QueryConfig {
  layout: Partial<Layout>;
  axes: GraphValueAxes;
  colors: LineColors;
}
