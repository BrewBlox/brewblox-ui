import { Annotations, Layout, PlotData } from 'plotly.js';

import { StoreObject } from '@/shared-types';

export interface QueryParams {
  database?: string;
  start?: string | number;
  duration?: string;
  end?: string | number;
  limit?: number;
  orderBy?: string;
  policy?: string;
  approxPoints?: number;
}

export interface QueryTarget {
  measurement: string;
  fields: string[];
}

export interface ApiQuery {
  // QueryParams
  database?: string;
  start?: string | number;
  duration?: string;
  end?: string | number;
  limit?: number;
  order_by?: string;
  policy?: string;
  approx_points?: number;

  // QueryTarget
  measurement: string;
  fields: string[];

  // new
  epoch: string;
}

export interface DisplayNames {
  [key: string]: string;
}

export interface QueryConfig {
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
}

export type GraphAxis = 'y' | 'y2';

export interface GraphValueAxes {
  [key: string]: GraphAxis;
}

export interface LineColors {
  [key: string]: string;
}

export interface LabelPrecision {
  [key: string]: number;
}

export interface HistorySource {
  id: string;
  command: 'metrics' | 'ranges';
  transformer: (source: any, result: any) => HistorySource;
  params: QueryParams;
  target: QueryTarget;
  renames: DisplayNames;
}

export type Slice = number[];

export interface QueryResult {
  name: string;
  columns: string[];
  values: Slice[];
  database: string;
  policy: string;
  initial?: boolean;
}

export interface TsdbRange {
  metric: {
    __name__: string;
  }
  values: [timestamp: number, value: string][]
}

export interface TsdbMetric {
  metric: {
    __name__: string;
  }
  value: [timestamp: number, value: string]
}

export interface TsdbRangesResult {
  initial: boolean;
  ranges: TsdbRange[];
}

export interface TsdbMetricsResult {
  initial: boolean;
  metrics: TsdbMetric[];
}

export interface GraphFieldResult extends PlotData {
  type: 'scatter';
  mode: 'lines';
  name: string;
  yaxis: GraphAxis;
  line: { color: string };
  x: number[];
  y: number[];
}

export interface GraphSource extends HistorySource {
  transformer: (source: GraphSource, result: TsdbRangesResult) => HistorySource;
  axes: GraphValueAxes;
  colors: LineColors;
  precision: LabelPrecision;
  usedPolicy?: string;
  values: Mapped<GraphFieldResult>;
}

export interface MetricsResult {
  field: string;
  time: number;
  value: number | null;
}

export interface MetricsSource extends HistorySource {
  transformer: (source: MetricsSource, result: TsdbMetricsResult) => HistorySource;
  values: MetricsResult[];
}

export type GraphAnnotation = Partial<Annotations>;

export interface GraphConfig extends QueryConfig {
  layout: Partial<Layout>;
  axes: GraphValueAxes;
  colors: LineColors;
  precision: LabelPrecision;
}

export interface SharedGraphConfig {
  id: string;
  title: string;
  config: GraphConfig;
}

export interface SessionNoteBase {
  id: string;
  title: string;
  col: number;
}

export interface SessionTextNote extends SessionNoteBase {
  type: 'Text';
  value: string;
}

export interface SessionGraphNote extends SessionNoteBase {
  type: 'Graph';
  start: number | null;
  end: number | null;
  config: GraphConfig;
}

export type SessionNote = SessionTextNote | SessionGraphNote;

export interface LoggedSession extends StoreObject {
  id: string;
  title: string;
  date: number;
  notes: SessionNote[];
  tags?: string[];
}
