import { Block } from '@/plugins/spark/types';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string;
  };
}
