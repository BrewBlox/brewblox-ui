import { Widget } from '@/store/dashboards';

export interface WebframeConfig {
  url: string;
}

export type WebframeWidget = Widget<WebframeConfig>;
