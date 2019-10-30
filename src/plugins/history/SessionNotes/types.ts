import { PersistentWidget } from '@/store/dashboards';

export interface SessionNote {
  id: string;
  title: string;
  type: 'text' | 'date';
  value: string | null;
}

export interface SessionNotesConfig {
  notes: SessionNote[];
}

export interface SessionNotesWidget extends PersistentWidget {
  config: SessionNotesConfig;
}
