import { Unit } from '@/helpers/units';

import { BlockProperty } from './types';

export const dataProps: Record<string, BlockProperty[]> = {
  ActuatorAnalog: [
    {
      key: 'setting',
      title: 'Setting',
      type: 'number',
      generate: () => 0,
    },
    {
      key: 'minSetting',
      title: 'Minimum Setting',
      type: 'number',
      generate: () => 0,
    },
    {
      key: 'maxSetting',
      title: 'Maximum Setting',
      type: 'number',
      generate: () => 100,
    },
    {
      key: 'minValue',
      title: 'Minimum Value',
      type: 'number',
      generate: () => 0,
    },
    {
      key: 'maxValue',
      title: 'Maximum Value',
      type: 'number',
      generate: () => 100,
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
      generate: () => 0,
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
      generate: () => new Unit(20, 'degC'),
    },
    {
      key: 'settingEnabled',
      title: 'Enabled',
      type: 'boolean',
      generate: () => true,
    },
  ],
  TempSensorMock: [
    {
      key: 'value',
      title: 'Sensor Value',
      type: 'Unit',
      generate: () => new Unit(20, 'degC'),
    },
  ],
  TempSensorOneWire: [],
};
