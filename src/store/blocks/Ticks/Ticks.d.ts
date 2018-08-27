import { Block } from '../state';

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number,
    secondsSinceEpoch: number,
  }
}
