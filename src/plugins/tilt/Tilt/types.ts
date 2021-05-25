import { Widget } from '@/store/widgets';

import { TiltFieldIndex } from '../types';

export interface TiltWidgetConfig {
  serviceId: string | null;
  color: string | null;
  hidden: Partial<TiltFieldIndex>;
}

export type TiltWidget = Widget<TiltWidgetConfig>;
