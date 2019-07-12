import { Block } from '../../types';


export interface DeprecatedObjectData {
  actualId: number;
}

export interface DeprecatedObjectBlock extends Block {
  data: DeprecatedObjectData;
}
