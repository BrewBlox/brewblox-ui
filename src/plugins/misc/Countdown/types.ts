import { Widget } from '@/store/widgets';

export interface CountdownSession {
  duration: number;
  startedAt: number;
  pausedAt: number | null;
  pausedDuration: number;
}

export interface CountdownConfig {
  baseDuration: number;
  session: CountdownSession | null;
}

export type CountdownWidget = Widget<CountdownConfig>;
