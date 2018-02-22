import store from '../';
import { blocks, dispatch } from './';
import { BlockUpdate } from './state';
import {commitUpdateBlock} from './mutations';

export const dispatchFindBlock = dispatch(blocks.actions.findBlock);

export const findBlock = (id: string) => {
  dispatchFindBlock(store, id);
};

export const updateBlock = (block: BlockUpdate) => {
  commitUpdateBlock(store, block);
};
