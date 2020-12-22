import { Widget } from '@/store/dashboards';

export interface WebframeConfig {
  scale: number;
  url: string;
}

export type WebframeWidget = Widget<WebframeConfig>;
