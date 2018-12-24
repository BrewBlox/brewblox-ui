import { Block } from '@/plugins/spark/state';

export interface DS2413Block extends Block {
  data: {
    address: string;
    state: number;
  };
}
