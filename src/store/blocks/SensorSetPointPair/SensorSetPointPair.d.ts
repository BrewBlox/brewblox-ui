import { BlockBase } from '../state';

export interface SensorSetPointPair extends BlockBase {
  links: {
    sensor: string,
    setpoint: string,
  };
}

export interface SensorSetPointPairPersist {
  links: {
    sensor: string,
    setpoint: string,
  };
}

export interface SensorSetPointPairUpdate extends BlockBase, SensorSetPointPairPersist {}

export interface SensorSetPointPairBlock extends SensorSetPointPair {
  type: 'SensorSetPointPair';
}
