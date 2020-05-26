import { BlockBase, IoPin } from '@/plugins/spark/types';

export enum DS2413Id {
  A = 1,
  B = 2,
}

export interface DS2413Data {
  address: string;
  connected: boolean;
  pins: IoPin[];
}

export interface DS2413Block extends BlockBase {
  type: 'DS2413';
  data: DS2413Data;
}
