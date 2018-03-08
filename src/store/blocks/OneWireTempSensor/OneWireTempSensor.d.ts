import { BlockBase } from '../state';

export interface OneWireTempSensor extends BlockBase {
  settings: {
    address: string,
    offset: number,
  };
  state: {
    value: number,
    connected: boolean,
  };
}

export interface OneWireTempSensorUpdate extends BlockBase {
  settings: {
    address?: string,
    offset?: number,
  };
}

export interface OneWireTempSensorBlock extends OneWireTempSensor {
  type: 'OneWireTempSensor';
}
