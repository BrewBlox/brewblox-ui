import { Widget } from '@/store/dashboards';

export interface TiltWidgetConfig {
  serviceId: string | null;
  color: string | null;
}

export type TiltWidget = Widget<TiltWidgetConfig>;
