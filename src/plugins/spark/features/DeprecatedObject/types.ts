import { BlockBase } from '@/plugins/spark/types';


export interface DeprecatedObjectData {
  actualId: number;
}

export interface DeprecatedObjectBlock extends BlockBase {
  type: 'DeprecatedObject';
  data: DeprecatedObjectData;
}
