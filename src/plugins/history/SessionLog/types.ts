import { Widget } from '@/store/widgets';

export interface SessionLogConfig {
  currentSession: string | null;
}

export type SessionLogWidget = Widget<SessionLogConfig>;
