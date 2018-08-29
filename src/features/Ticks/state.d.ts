import { Block } from '@/store/blocks/state';

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number,
    secondsSinceEpoch: number,
  }
}
