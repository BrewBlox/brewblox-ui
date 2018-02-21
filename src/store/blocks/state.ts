import { SetPointBlock } from './setpoint/setpoint';
import { SensorBlock } from './sensor/sensor';

export interface BlockBase {
  id: string,
}

export type Block = SetPointBlock | SensorBlock;

export type BlocksState = {
  blocks: string[],
  byId: {
    [id: string]: Block;
  },
};
