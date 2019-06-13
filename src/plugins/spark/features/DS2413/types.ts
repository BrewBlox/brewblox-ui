import { Block, IoPin } from '@/plugins/spark/types';

export enum DS2413Id {
  A = 1,
  B = 2,
}

export interface DS2413Block extends Block {
  data: {
    address: string;
    connected: boolean;
    pins: IoPin[];
  };
}
