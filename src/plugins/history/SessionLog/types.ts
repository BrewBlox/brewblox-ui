import { Widget } from '@/store/dashboards';

export interface SessionLogConfig {
  currentSession: string | null;
}

export type SessionLogWidget = Widget<SessionLogConfig>;
