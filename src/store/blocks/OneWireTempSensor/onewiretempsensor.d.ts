import { BlockBase } from '../state';

export interface OneWireTempSensor extends BlockBase {
  value: number;
}

export interface OneWireTempSensorBlock extends OneWireTempSensor {
  type: 'OneWireTempSensor';
}
