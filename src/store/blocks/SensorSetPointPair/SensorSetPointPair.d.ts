import { BlockBase } from '../state';
import { NewBlockBase } from '@/store/blocks/state';

export interface SensorSetPointPair extends BlockBase {
  links: {
    sensor: string,
    setpoint: string,
  };
}

export interface SensorSetPointPairPersisted {
  links: {
    sensor: string,
    setpoint: string,
  };
}

export interface SensorSetPointPairCreate extends NewBlockBase, SensorSetPointPairPersisted {
  type: 'SensorSetPointPair';
}

export interface SensorSetPointPairUpdate extends BlockBase, SensorSetPointPairPersisted {}

export interface SensorSetPointPairBlock extends SensorSetPointPair {
  type: 'SensorSetPointPair';
}
