import { ActionContext } from 'vuex';

import { SetPointBlock, SetPoint } from './setpoint/setpoint';
import { SensorBlock, Sensor } from './sensor/sensor';
import { State as RootState } from '../state';

export interface BlockBase {
  id: string,
  controllerId?: string,
}

export type Block = SetPointBlock | SensorBlock;
export type BlockUpdate = SetPoint | Sensor;

export type BlocksState = {
  allIds: string[],
  byId: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
