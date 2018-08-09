import { BlockBase, MetricsBase } from '../state';
import { Temperature } from '@/core/units';

export interface OneWireTempSensor extends BlockBase, MetricsBase {
  settings: {
    address: string,
    offset: number,
  };
  state: {
    value: Temperature,
    connected: boolean,
  };
}

export interface OneWireTempSensorUpdate extends BlockBase {
  settings: {
    address: string,
    offset: number,
  };
}

export interface OneWireTempSensorBlock extends OneWireTempSensor {
  type: 'OneWireTempSensor';
}
