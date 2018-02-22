import { ActionContext } from 'vuex';

import { SetPointBlock, SetPoint } from './setpoint/setpoint';
import { OneWireTempSensorBlock, OneWireTempSensor } from './OneWireTempSensor/onewiretempsensor';
import { State as RootState } from '../state';

export interface BlockBase {
  id: string,
  controllerId?: string,
}

export type Block = SetPointBlock | OneWireTempSensorBlock;
export type BlockUpdate = SetPoint | OneWireTempSensor;

export type BlocksState = {
  allIds: string[],
  byId: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
