import { Block } from '@/services/spark/state';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string,
  };
}
