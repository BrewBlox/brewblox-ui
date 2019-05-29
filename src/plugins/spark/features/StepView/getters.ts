import { BlockProperty } from './types';

export const dataProps: Record<string, BlockProperty[]> = {
  ActuatorAnalog: [
    {
      key: 'setting',
      title: 'Setting',
      type: 'number',
    },
    {
      key: 'minSetting',
      title: 'Minimum Setting',
      type: 'number',
    },
    {
      key: 'maxSetting',
      title: 'Maximum Setting',
      type: 'number',
    },
    {
      key: 'minValue',
      title: 'Minimum Value',
      type: 'number',
    },
    {
      key: 'maxValue',
      title: 'Maximum Value',
      type: 'number',
    },
  ],
  ActuatorDS2413: [

  ],
  ActuatorOffset: [],
  ActuatorPin: [],
  ActuatorPwm: [
    {
      key: 'setting',
      title: 'Duty Setting',
      type: 'number',
    },
  ],
  Balancer: [],
  DisplaySettings: [],
  DS2413: [],
  Mutex: [],
  Pid: [],
  SetpointProfile: [],
  SetpointSensorPair: [
    {
      key: 'storedSetting',
      title: 'Setting',
      type: 'Unit',
    },
    {
      key: 'settingEnabled',
      title: 'Enabled',
      type: 'boolean',
    },
  ],
  TempSensorMock: [
    {
      key: 'value',
      title: 'Sensor Value',
      type: 'Unit',
    },
  ],
  TempSensorOneWire: [],
};
