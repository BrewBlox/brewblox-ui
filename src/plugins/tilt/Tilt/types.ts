import { TiltFieldIndex } from '../types';
import { Widget } from '@/store/widgets';

export interface TiltWidgetConfig {
  serviceId: string | null;
  mac: string | null;
  hidden: Partial<TiltFieldIndex>;
}

export type TiltWidget = Widget<TiltWidgetConfig>;
