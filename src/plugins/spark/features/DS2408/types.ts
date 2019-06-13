import { Block, IoChannel } from '@/plugins/spark/types';

export enum DS2408Id {
  A = 1,
  B = 2,
  C = 3,
  D = 4,
  E = 5,
  F = 6,
  G = 7,
  H = 8,
}

export interface DS2408Block extends Block {
  data: {
    address: string;
    connected: boolean;
    pins: IoChannel[];
  };
}
