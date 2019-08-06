
export interface QueryParams {
  database?: string;
  start?: string | number;
  duration?: string;
  end?: string | number;
  limit?: number;
  orderBy?: string;
  approxPoints?: number;
}

export interface QueryTarget {
  measurement: string;
  fields: string[];
}

export interface DisplayNames {
  [key: string]: string;
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
