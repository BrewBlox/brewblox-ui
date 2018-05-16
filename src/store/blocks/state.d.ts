import { ActionContext } from 'vuex';

import {
  PIDBlock,
  PIDUpdate,
} from './PID/PID';

import {
  SetPointSimpleBlock,
  SetPointSimple,
} from './SetPointSimple/SetPointSimple';

import {
  OneWireTempSensorBlock,
  OneWireTempSensorUpdate,
} from './OneWireTempSensor/OneWireTempSensor';

import {
  SensorSetPointPairBlock,
  SensorSetPointPairUpdate,
} from './SensorSetPointPair/SensorSetPointPair';

import { State as RootState } from '../state';

export interface BlockBase {
  id: string;
  serviceId: string;
  isLoading?: boolean;
}

type Value = string|number[];

interface Series {
  name: string; // eslint-disable-line no-restricted-globals
  columns: string[];
  values: Value[];
}

export interface MetricsBase {
  metrics: Series[];
}

export type Block =
  SetPointSimpleBlock | OneWireTempSensorBlock | SensorSetPointPairBlock | PIDBlock;
export type BlockSaveBase =
  (BlockBase & MetricsBase) |
  SetPointSimple |
  OneWireTempSensorUpdate |
  SensorSetPointPairUpdate |
  PIDUpdate;

export type BlockSave = BlockSaveBase & {
  isLoading: boolean,
};

export interface BlockStateUpdate extends BlockBase {
  state: any;
}

export type BlocksState = {
  allIds: string[],
  byId: {
    [id: string]: Block;
  },
  fetching: boolean,
};

export type BlocksContext = ActionContext<BlocksState, RootState>;
