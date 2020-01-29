
export interface Dashboard {
  id: string;
  title: string;
  order: number;
  primary?: boolean;
  _rev?: string;
}

export interface Widget<ConfigT = any> {
  id: string;
  title: string;
  cols: number;
  rows: number;
  order: number;
  dashboard: string;
  feature: string;
  config: ConfigT;
  pinnedPosition?: XYPosition | null;
  _rev?: string;
}
