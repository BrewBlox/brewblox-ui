import { PersistentWidget } from '@/store/dashboards';

import { GraphConfig } from '../types';

export interface SessionNote {
  id: string;
  title: string;
  value: string;
  col: number;
}

export interface Session {
  id: string;
  title: string;
  start: number;
  end: number | null;
  notes: SessionNote[];
  graphCfg: GraphConfig;
}

export interface SessionLogConfig {
  currentSession: string | null;
  sessions: Session[];
}

export interface SessionLogWidget extends PersistentWidget {
  config: SessionLogConfig;
}
