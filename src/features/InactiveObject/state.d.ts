import { Block } from '@/store/blocks/state';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string,
  };
}
