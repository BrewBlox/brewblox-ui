import { Layout } from 'plotly.js';

import { GraphValueAxes, LineColors, QueryConfig } from '@/store/history';


export interface GraphConfig extends QueryConfig {
  layout: Partial<Layout>;
  axes: GraphValueAxes;
  colors: LineColors;
}

export interface SharedGraphConfig {
  id: string;
  title: string;
  config: GraphConfig;
}
