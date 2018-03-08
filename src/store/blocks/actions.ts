import { getStoreAccessors } from 'vuex-typescript';

import { fetchBlock, fetchBlocks, persistBlock as persistBlockToApi } from './api';

import store from '../';
import { BlocksState, BlocksContext, Block, BlockUpdateBase } from './state';
import { State as RootState } from '../state';

import { updateBlock, updateFetching } from './mutations';

import { addSetPoint } from './SetPointSimple/actions';
import { addOneWireTempSensor } from './OneWireTempSensor/actions';
import { addSensorSetPointPair } from './SensorSetPointPair/actions';

const { dispatch } = getStoreAccessors<BlocksState, RootState>('blocks');

function addBlock(block: Block) {
  switch (block.type) {
    case 'SensorSetPointPair':
      addSensorSetPointPair(block);
      break;
    case 'OneWireTempSensor':
      addOneWireTempSensor(block);
      break;
    case 'SetPointSimple':
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
  async persistBlock(context: BlocksContext, block: BlockUpdateBase) {
    // update isLoading
    updateBlock({ ...block, isLoading: true });

    // persist block to API and wait for result
    const savedBlock = await persistBlockToApi(block);

    // persist block on api
    updateBlock({ ...savedBlock, isLoading: false });
  },
};

// exported action accessors
export const findBlock =
  (id: string) => dispatch(actions.findBlock)(store, id);

export const listBlocks =
  () => dispatch(actions.listBlocks)(store);

export const persistBlock =
  (block: BlockUpdateBase) => dispatch(actions.persistBlock)(store, block);

export default actions;
