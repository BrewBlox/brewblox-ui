import { Block } from '@/plugins/spark/types';


export interface DeprecatedObjectData {
  actualId: number;
}

export interface DeprecatedObjectBlock extends Block {
  data: DeprecatedObjectData;
}
