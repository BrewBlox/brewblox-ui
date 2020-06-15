import { WidgetRole } from '@/store/features';

import { BlockCrud } from '../types';

export interface ValidatedWidget {
  id: string;
  key: string;
  component: string;
  crud: BlockCrud;
  title: string;
  role: WidgetRole;
  icon: string;
  expanded: boolean;
  error?: string;
}
