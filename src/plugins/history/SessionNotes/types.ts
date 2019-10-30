import { PersistentWidget } from '@/store/dashboards';

export interface SessionNote {
  id: string;
  title: string;
  value: string;
  col: number;
}

export interface Session {
  id: string;
  title: string;
  date: number;
  notes: SessionNote[];
}

export interface SessionNotesConfig {
  currentSession: string | null;
  sessions: Session[];
}

export interface SessionNotesWidget extends PersistentWidget {
  config: SessionNotesConfig;
}
