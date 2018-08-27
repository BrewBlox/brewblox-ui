import { Block } from '../state';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string,
  }
}
