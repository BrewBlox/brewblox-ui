import { Widget } from '@/store/widgets';

export interface StopwatchSession {
  timeStarted: number;
  timeStopped: number | null;
  stoppedDuration: number;
  running: boolean;
}

export interface StopwatchConfig {
  session: StopwatchSession | null;
}

export type StopwatchWidget = Widget<StopwatchConfig>;
