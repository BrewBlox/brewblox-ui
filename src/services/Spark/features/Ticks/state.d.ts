import { Block } from '@/services/Spark/state';

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number,
    secondsSinceEpoch: number,
  };
}
