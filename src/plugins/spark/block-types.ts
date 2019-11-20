import { typeName as ActuatorAnalogMock } from '@/plugins/spark/features/ActuatorAnalogMock/getters';
import { typeName as SetpointDriver } from '@/plugins/spark/features/ActuatorOffset/getters';
import { typeName as ActuatorPwm } from '@/plugins/spark/features/ActuatorPwm/getters';
import { typeName as Balancer } from '@/plugins/spark/features/Balancer/getters';
import { typeName as DigitalActuator } from '@/plugins/spark/features/DigitalActuator/getters';
import { typeName as DisplaySettings } from '@/plugins/spark/features/DisplaySettings/getters';
import { typeName as DS2408 } from '@/plugins/spark/features/DS2408/getters';
import { typeName as DS2413 } from '@/plugins/spark/features/DS2413/getters';
import { typeName as InactiveObject } from '@/plugins/spark/features/InactiveObject/getters';
import { typeName as MotorValve } from '@/plugins/spark/features/MotorValve/getters';
import { typeName as Mutex } from '@/plugins/spark/features/Mutex/getters';
import { typeName as Pid } from '@/plugins/spark/features/Pid/getters';
import { typeName as SetpointProfile } from '@/plugins/spark/features/SetpointProfile/getters';
import { typeName as SetpointSensorPair } from '@/plugins/spark/features/SetpointSensorPair/getters';
import { typeName as Spark2Pins } from '@/plugins/spark/features/Spark2Pins/getters';
import { typeName as Spark3Pins } from '@/plugins/spark/features/Spark3Pins/getters';
import { typeName as TempSensorMock } from '@/plugins/spark/features/TempSensorMock/getters';
import { typeName as TempSensorOneWire } from '@/plugins/spark/features/TempSensorOneWire/getters';

import { Block } from './types';

export * from '@/plugins/spark/features/ActuatorAnalogMock/types';
export * from '@/plugins/spark/features/ActuatorOffset/types';
export * from '@/plugins/spark/features/ActuatorPwm/types';
export * from '@/plugins/spark/features/Balancer/types';
export * from '@/plugins/spark/features/DigitalActuator/types';
export * from '@/plugins/spark/features/DisplaySettings/types';
export * from '@/plugins/spark/features/DS2408/types';
export * from '@/plugins/spark/features/DS2413/types';
export * from '@/plugins/spark/features/InactiveObject/types';
export * from '@/plugins/spark/features/MotorValve/types';
export * from '@/plugins/spark/features/Mutex/types';
export * from '@/plugins/spark/features/Pid/types';
export * from '@/plugins/spark/features/SetpointProfile/types';
export * from '@/plugins/spark/features/SetpointSensorPair/types';
export * from '@/plugins/spark/features/Spark2Pins/types';
export * from '@/plugins/spark/features/Spark3Pins/types';
export * from '@/plugins/spark/features/TempSensorMock/types';
export * from '@/plugins/spark/features/TempSensorOneWire/types';


export interface OneWireBusBlock extends Block {
  data: {
    command: {
      opcode: number;
      data: number;
    };
    address: string[];
  };
}

export interface GroupsBlock extends Block {
  data: {
    active: number[];
  };
}

export interface SysInfoBlock extends Block {
  data: {
    deviceId: string;
    platform: number;
    hardware: number;
    voltage5: number;
    voltage12: number;
    version: string;
    releaseDate: string;
    protocolVersion: string;
    protocolDate: string;
  };
}

export interface TicksBlock extends Block {
  data: {
    millisSinceBoot: number;
    secondsSinceEpoch: number;
  };
}

export interface WiFiSettingsBlock extends Block {
  data: {
    ssid: string;
    password: string;
    security: number;
    cipher: number;
    signal: number;
    ip: string;
  };
}

export const systemBlockTypes = {
  SysInfo: 'SysInfo',
  Groups: 'Groups',
  OneWireBus: 'OneWireBus',
  Ticks: 'Ticks',
  WiFiSettings: 'WiFiSettings',
  TouchSettings: 'TouchSettings',
};

export const blockTypes = {
  ...systemBlockTypes,
  ActuatorAnalogMock,
  SetpointDriver,
  ActuatorPwm,
  Balancer,
  DigitalActuator,
  DisplaySettings,
  DS2408,
  DS2413,
  InactiveObject,
  MotorValve,
  Mutex,
  Pid,
  SetpointProfile,
  SetpointSensorPair,
  Spark2Pins,
  Spark3Pins,
  TempSensorMock,
  TempSensorOneWire,
};

export const interfaceTypes = {
  ProcessValue: 'ProcessValueInterface',
  TempSensor: 'TempSensorInterface',
  SetpointSensorPair: 'SetpointSensorPairInterface',
  ActuatorAnalog: 'ActuatorAnalogInterface',
  ActuatorDigital: 'ActuatorDigitalInterface',
  Balancer: 'BalancerInterface',
  IoArray: 'IoArrayInterface',
};

export const isSystemBlock =
  ({ type }: { type: string }): boolean =>
    systemBlockTypes[type] !== undefined;
