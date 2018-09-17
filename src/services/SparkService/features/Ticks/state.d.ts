import { Block } from '@/services/SparkService/state';

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number,
    secondsSinceEpoch: number,
  };
}
