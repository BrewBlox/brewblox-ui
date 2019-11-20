import { PersistentWidget } from '@/store/dashboards';

export interface SessionLogConfig {
  currentSession: string | null;
}

export type SessionLogWidget = PersistentWidget<SessionLogConfig>;
