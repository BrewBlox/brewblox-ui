import { BlockType } from '@/shared-types';
import { WidgetRole } from '@/store/features';

import { BlockAddress } from '../types';

export interface ListRenderAddress extends BlockAddress {
  serviceId: string;
  id: string;
  type: BlockType;
  name: string;
  title: string;
  role: WidgetRole;
}
