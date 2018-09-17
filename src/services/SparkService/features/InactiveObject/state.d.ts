import { Block } from '@/services/SparkService/state';

export interface InactiveObjectBlock extends Block {
  data: {
    actualType: string,
  };
}
