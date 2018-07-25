import { BlockBase, MetricsBase } from '../state';
import { Celsius } from '@/core/units';

export interface OneWireTempSensor extends BlockBase, MetricsBase {
  settings: {
    address: string,
    offset: number,
  };
  state: {
    value: Celsius,
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
