import { Service } from '@/store/services';

import { Quantity } from '../spark/types';

export interface TiltServiceConfig {
  tempUnit: 'degC' | 'degF';
}

export type TiltService = Service<TiltServiceConfig>;

export interface TiltStateEvent {
  key: string; // Service ID
  type: 'Tilt.state';
  colour: string;
  timestamp: number; // ms date
  data: {
    'Temperature[degF]': number;
    'Temperature[degC]': number;
    'Specific gravity': number;
    'Signal strength[dBm]': number;
    'Plato[degP]': number;

    // Present if calibration values are provided
    'Calibrated temperature[degF]'?: number;
    'Calibrated temperature[degC]'?: number;
    'Calibrated specific gravity'?: number;
    'Calibrated plato[degP]'?: number;
  };
}

export interface TiltStateValue {
  id: string;
  serviceId: string;
  color: string;
  timestamp: Date;
  data: {
    temperature: Quantity;
    specificGravity: number;
    signalStrength: Quantity;
    plato: Quantity;
    calibratedTemperature: Quantity;
    calibratedSpecificGravity: number | null;
    calibratedPlato: Quantity;
  };
}

export type TiltFieldIndex = {
  [k in keyof TiltStateValue['data']]: boolean;
} & {
  timestamp: boolean;
  color: boolean;
}
