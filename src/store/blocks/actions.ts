import { getStoreAccessors } from 'vuex-typescript';

import { fetchBlock } from './api';

import store from '../';
import { BlocksState, BlockUpdate, BlocksContext } from './state';
import { State as RootState } from '../state';

import { commitUpdateBlock } from './mutations';

import { addSetPoint } from './setpoint/actions';
import { addSensor } from './sensor/actions';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

const actions = {
  async findBlock(context: BlocksContext, id: string) {
    // will fetch a block from the server
    const block = await fetchBlock(id);

    switch (block.type) {
      case 'sensor':
        addSensor(block);
        break;
      case 'setpoint':
        addSetPoint(block);
        break;
      default:
        throw new Error('Invalid block type');
    }
  },
};

export const dispatchFindBlock = dispatch(actions.findBlock);

export const findBlock = (id: string) => {
  dispatchFindBlock(store, id);
};

export const updateBlock = (block: BlockUpdate) => {
  commitUpdateBlock(store, block);
};

export default actions;
