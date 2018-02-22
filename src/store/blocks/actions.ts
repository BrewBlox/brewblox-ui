import { getStoreAccessors } from 'vuex-typescript';

import { fetchBlock, fetchBlocks } from './api';

import store from '../';
import { BlocksState, BlocksContext, Block } from './state';
import { State as RootState } from '../state';

import { updateBlock, updateFetching } from './mutations';

import { addSetPoint } from './SetPointSimple/actions';
import { addOneWireTempSensor } from './OneWireTempSensor/actions';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

function addBlock(block: Block) {
  switch (block.type) {
    case 'OneWireTempSensor':
      addOneWireTempSensor(block);
      break;
    case 'setpoint':
      addSetPoint(block);
      break;
    default:
      throw new Error('Invalid block type');
  }
}

const actions = {
  async findBlock(context: BlocksContext, id: string) {
    // will fetch a block from the server
    addBlock(await fetchBlock(id));
  },
  async listBlocks() {
    // update isFetching
    updateFetching(true);

    // will fetch blocks from the server
    const blocks = await fetchBlocks();
    blocks.forEach(addBlock);

    // update isFetching
    updateFetching(false);
  },
};

export const dispatchFindBlock = dispatch(actions.findBlock);
export const dispatchListBlocks = dispatch(actions.listBlocks);

// actions
export const findBlock = (id: string) => {
  dispatchFindBlock(store, id);
};

export const listBlocks = () => {
  dispatchListBlocks(store);
};

// mutations
export { updateBlock };

export default actions;
