import { Widget } from '@/store/widgets';

export interface WebframeConfig {
  scale: number;
  url: string;
}

export type WebframeWidget = Widget<WebframeConfig>;
