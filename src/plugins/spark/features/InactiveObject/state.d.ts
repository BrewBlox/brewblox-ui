import { Block } from '@/plugins/spark/state';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string,
  };
}
