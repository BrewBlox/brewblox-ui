import { ActionContext } from 'vuex';

import { SetPointSimpleBlock, SetPointSimple } from './SetPointSimple/SetPointSimple';
import { OneWireTempSensorBlock, OneWireTempSensor } from './OneWireTempSensor/OneWireTempSensor';
import { State as RootState } from '../state';

export interface BlockBase {
  id: string,
}

export type Block = SetPointSimpleBlock | OneWireTempSensorBlock;
export type BlockUpdate = SetPointSimple | OneWireTempSensor;

export type BlocksState = {
  allIds: string[],
  byId: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
