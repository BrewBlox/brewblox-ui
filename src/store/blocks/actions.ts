import store from '../';
import { blocks, dispatch } from './';

export const dispatchFindBlock = dispatch(blocks.actions.findBlock);

export const findBlock = (id: string) => {
  dispatchFindBlock(store, id);
};
