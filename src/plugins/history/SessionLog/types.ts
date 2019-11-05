import { PersistentWidget } from '@/store/dashboards';

import { GraphConfig } from '../types';


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

export interface Session {
  id: string;
  title: string;
  date: number;
  notes: SessionNote[];
}

export interface SessionLogConfig {
  currentSession: string | null;
  sessions: Session[];
}

export interface SessionLogWidget extends PersistentWidget {
  config: SessionLogConfig;
}
