import { DateString, StoreObject } from 'brewblox-proto/ts';
import { Annotations, Layout, PlotData } from 'plotly.js';

export interface QueryParams {
  database?: string;
  start?: DateString;
  duration?: string;
  end?: DateString;
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
  start?: DateString;
  duration?: string;
  end?: DateString;
  fields: string[];
}

export type CsvPrecision = 'ns' | 'ms' | 's' | 'ISO8601';

export interface CsvQuery extends ApiQuery {
  precision: CsvPrecision;
}

export interface DisplayNames {
  [key: string]: string;
}

// Deprecated
export interface QueryConfigV0 {
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
}

export interface QueryConfig {
  params: QueryParams;
  fields: string[];
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

export interface TimeSeriesRange {
  metric: {
    __name__: string;
  };
  values: [timestamp: number, value: string][];
}

export interface TimeSeriesMetric {
  metric: string;
  value: number;
  timestamp: number;
}

export interface TimeSeriesRangesResult {
  initial: boolean;
  ranges: TimeSeriesRange[];
}

export interface TimeSeriesMetricsResult {
  metrics: TimeSeriesMetric[];
}

export interface RangeValue extends PlotData {
  type: 'scattergl';
  mode: 'lines';
  name: string;
  yaxis: GraphAxis;
  line: { color: string };
  x: number[];
  y: number[];
}

export interface MetricValue {
  field: string;
  time: number;
  value: number | null;
}

export interface HistorySource {
  id: string;
  command: 'metrics' | 'ranges';
  transformer: (source: any, result: any) => HistorySource;
  params: QueryParams;
  fields: string[];
  renames: DisplayNames;
}

export interface GraphSource extends HistorySource {
  transformer: (
    source: GraphSource,
    result: TimeSeriesRangesResult,
  ) => HistorySource;
  axes: GraphValueAxes;
  colors: LineColors;
  precision: LabelPrecision;
  values: Mapped<RangeValue>;
  truncated: boolean;
}

export interface MetricsSource extends HistorySource {
  transformer: (
    source: MetricsSource,
    result: TimeSeriesMetricsResult,
  ) => HistorySource;
  updated: Date;
  values: MetricValue[];
}

export type GraphAnnotation = Partial<Annotations>;

export interface GraphConfig extends QueryConfig {
  version: '1.0';
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

export interface MetricsConfig extends QueryConfig {
  version: '1.0';
  freshDuration: Mapped<number>;
  decimals: Mapped<number>;
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
  start: DateString | null;
  end: DateString | null;
  config: GraphConfig;
}

export type SessionNote = SessionTextNote | SessionGraphNote;

export interface LoggedSession extends StoreObject {
  id: string;
  title: string;
  date: DateString;
  notes: SessionNote[];
  tags?: string[];
}
