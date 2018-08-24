import { Block } from '../state';

export interface InactiveObjectBlock extends Block {
  data: {
    actual_type: string,
  }
}
