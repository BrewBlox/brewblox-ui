import { Widget } from '@/store/widgets';

export interface SparkDisplayConfig {
  serviceId: string | null;
}

export type SparkDisplayWidget = Widget<SparkDisplayConfig>;
