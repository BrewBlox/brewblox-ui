import { Block, IoPin } from '@/plugins/spark/types';

export enum DS2413Id {
  A = 1,
  B = 2,
}

export interface DS2413Data {
  address: string;
  connected: boolean;
  pins: IoPin[];
}

export interface DS2413Block extends Block {
  data: DS2413Data;
}
