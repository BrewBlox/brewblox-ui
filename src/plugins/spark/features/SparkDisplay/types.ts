import { Widget } from '@/store/dashboards';


export interface SparkDisplayConfig {
  serviceId: string | null;
}

export type SparkDisplayWidget = Widget<SparkDisplayConfig>;
