import { WidgetRole } from '@/store/features';
import { Widget } from '@/store/widgets';

import { BlockConfig } from '../types';

export interface ValidatedWidget {
  id: string;
  key: string;
  component: string;
  widget: Widget<BlockConfig>;
  title: string;
  role: WidgetRole;
  icon: string;
  expanded: boolean;
  error?: string;
}
