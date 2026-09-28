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

export interface RangeMin {
  [key: string]: number | null;
}

export interface RangeMax {
  [key: string]: number | null;
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
  timestamp: DateString;
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
  time: Date;
  value: number | null;
}

export interface HistorySource {
  id: string;
  command: 'metrics' | 'ranges';
  params: QueryParams;
  fields: string[];
  renames: DisplayNames;
}

export interface GraphSource extends HistorySource {
  command: 'ranges';
  axes: GraphValueAxes;
  colors: LineColors;
  precision: LabelPrecision;
  values: Mapped<RangeValue>;
  truncated: boolean;
  min?: RangeMin;
  max?: RangeMax;
}

export interface MetricsSource extends HistorySource {
  command: 'metrics';
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
  min?: RangeMin;
  max?: RangeMax;
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

/**
 * The status of the history service's migration of a legacy database,
 * as returned by `GET /history/timeseries/migrate` (`MigrationStatus` in brewblox-history).
 * Times are Unix seconds.
 */
export interface MigrationStatus {
  /**
   * seed: copying the last days of raw samples into the dense database.
   * walk: averaging the whole legacy history into the long-term database, newest first.
   */
  phase: 'seed' | 'walk' | 'done';
  running: boolean;
  cancelled: boolean;
  /** Days of raw samples the seed copies */
  dense_days: number;
  /** The walk starts one interval after this */
  earliest: number;
  /** The long-term database's resolution in seconds */
  sparse_interval: number;
  /** The end of the legacy history */
  legacy_end: number;
  chunks_total: number;
  /** Null until counted */
  chunks_done: number | null;
  /** Kept while the migration tries again after an error */
  last_error: string | null;
  started: number;
  finished: number | null;
  lost_chunks: number[];
  missing_series: string[];
}
