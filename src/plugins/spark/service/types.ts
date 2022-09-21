import { WidgetRole } from '@/store/features';
import { BlockType } from 'brewblox-proto/ts';
import { BlockAddress } from '../types';

export interface ListRenderAddress extends BlockAddress {
  serviceId: string;
  id: string;
  type: BlockType;
  name: string;
  title: string;
  role: WidgetRole;
}
