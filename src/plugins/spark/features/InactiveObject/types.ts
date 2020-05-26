import { BlockBase } from '@/plugins/spark/types';

export interface InactiveObjectBlock extends BlockBase {
  type: 'InactiveObject';
  data: {
    actualType: string;
  };
}
