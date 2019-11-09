import { Layout } from 'plotly.js';

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

export interface DisplayNames {
  [key: string]: string;
}

export interface QueryConfig {
  params: QueryParams;
  targets: QueryTarget[];
  renames: DisplayNames;
}

export interface GraphValueAxes {
  [key: string]: 'y' | 'y2';
}

export interface LineColors {
  [key: string]: string;
}

export type Slice = number[];

export interface QueryResult {
  name: string;
  columns: string[];
  values: Slice[];
  database: string;
  policy: string;
}

export interface Listener {
  id: string;
  transformer: (listener: any, result: any) => Listener;
  params: QueryParams;
  target: QueryTarget;
  renames: DisplayNames;
  source?: EventSource;
  values?: any;
}

export interface GraphValuesListener extends Listener {
  axes: GraphValueAxes;
  colors: LineColors;
  usedPolicy?: string;
}

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

export interface LoggedSession {
  id: string;
  title: string;
  date: number;
  notes: SessionNote[];
  _rev?: string;
}
