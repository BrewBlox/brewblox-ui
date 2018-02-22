import { SetPointBlock, SetPoint } from './setpoint/setpoint';
import { SensorBlock, Sensor } from './sensor/sensor';

export interface BlockBase {
  id: string,
}

export type Block = SetPointBlock | SensorBlock;

export type BlockUpdate = Sensor | SetPoint;

export type BlocksState = {
  blocks: string[],
  byId: {
    [id: string]: Block;
  },
};
