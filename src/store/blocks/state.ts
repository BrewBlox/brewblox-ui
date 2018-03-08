import { ActionContext } from 'vuex';

import { SetPointSimpleBlock, SetPointSimple } from './SetPointSimple/SetPointSimple';
import { OneWireTempSensorBlock, OneWireTempSensor } from './OneWireTempSensor/OneWireTempSensor';
import {
  SensorSetPointPairBlock,
  SensorSetPointPairUpdate,
} from './SensorSetPointPair/SensorSetPointPair';
import { State as RootState } from '../state';

export interface BlockBase {
  id: string;
  isLoading?: boolean;
}

export type Block = SetPointSimpleBlock | OneWireTempSensorBlock | SensorSetPointPairBlock;
export type BlockUpdateBase = SetPointSimple | OneWireTempSensor | SensorSetPointPairUpdate;

export type BlockUpdate = BlockUpdateBase & {
  isLoading: boolean,
};

export type BlocksState = {
  allIds: string[],
  byId: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
