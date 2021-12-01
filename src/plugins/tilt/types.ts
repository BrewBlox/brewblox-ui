import { Service } from '@/store/services';

import { Quantity } from '../spark/types';

export type TiltService = Service<Record<string, never>>;

export interface TiltServiceStateEvent {
  key: string; // Service ID
  type: 'Tilt.state.service';
  timestamp: number; // ms date
}

export interface TiltStateEvent {
  key: string; // Service ID
  type: 'Tilt.state';
  timestamp: number; // ms date
  color: string;
  mac: string;
  name: string;
  data: {
    'temperature[degF]': number;
    'temperature[degC]': number;
    specificGravity: number;
    'rssi[dBm]': number;
    'plato[degP]': number;

    // Present if calibration values are provided
    'uncalibratedTemperature[degF]'?: number;
    'uncalibratedTemperature[degC]'?: number;
    uncalibratedSpecificGravity?: number;
    'uncalibratedPlato[degP]'?: number;
  };
}

export interface TiltStateValue {
  id: string;
  serviceId: string;
  timestamp: Date;
  color: string;
  mac: string;
  name: string;
  data: {
    temperature: Quantity;
    specificGravity: number;
    rssi: Quantity;
    plato: Quantity;
    uncalibratedTemperature: Quantity;
    uncalibratedSpecificGravity: number | null;
    uncalibratedPlato: Quantity;
  };
}

export type TiltFieldIndex = {
  [k in keyof TiltStateValue['data']]: boolean;
} & {
  timestamp: boolean;
  color: boolean;
  mac: boolean;
  name: boolean;
};
