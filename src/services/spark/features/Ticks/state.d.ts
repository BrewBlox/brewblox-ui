import { Block } from '@/services/spark/state';

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number,
    secondsSinceEpoch: number,
  };
}
