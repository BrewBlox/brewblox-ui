import { BlockBase } from '../state';

export interface OneWireTempSensor extends BlockBase {
  settings: {
    address: string,
    offset: number,
  },
  state: {
    value: number,
    connected: boolean,
  },
}

export interface OneWireTempSensorBlock extends OneWireTempSensor {
  type: 'OneWireTempSensor';
}
