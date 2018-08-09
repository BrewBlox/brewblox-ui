import { BlockBase } from '../state';
import { NewBlockBase } from '@/store/blocks/state';

export interface SensorSetPointPair extends BlockBase {
  sensor: string;
  setpoint: string;
}

export interface SensorSetPointPairPersisted {
  sensor: string;
  setpoint: string;
}

export interface SensorSetPointPairCreateNew extends NewBlockBase, SensorSetPointPairPersisted {}

export interface SensorSetPointPairCreate extends SensorSetPointPairCreateNew {
  type: 'SensorSetPointPair';
}

export interface SensorSetPointPairUpdate extends BlockBase, SensorSetPointPairPersisted {}

export interface SensorSetPointPairBlock extends SensorSetPointPair {
  type: 'SensorSetPointPair';
}
