import { BlockBase } from '../state';

export interface Sensor extends BlockBase {
  value: number;
}

export interface SensorBlock extends Sensor {
  type: 'sensor';
}
