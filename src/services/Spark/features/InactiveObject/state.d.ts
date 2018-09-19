import { Block } from '@/services/Spark/state';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string,
  };
}
