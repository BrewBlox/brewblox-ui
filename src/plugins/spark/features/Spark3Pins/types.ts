import { Block, IoChannel } from '@/plugins/spark/types';

export interface Spark3PinsBlock extends Block {
  data: {
    pins: { [key: string]: IoChannel }[];
  };
}
