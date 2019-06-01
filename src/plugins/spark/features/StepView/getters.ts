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
    {
      key: 'channel',
      title: 'DS2413 Channel',
      type: 'number',
      generate: () => 0,
    },
    {
      key: 'invert',
      title: 'Invert',
      type: 'boolean',
      generate: () => false,
    },
  ],
  ActuatorOffset: [
    {
      key: 'setting',
      title: 'Target offset',
      type: 'number',
      generate: () => 0,
    },
    {
      key: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      generate: () => true,
    },
  ],
  ActuatorPin: [
    {
      key: 'state',
      title: 'State',
      type: 'number',
      generate: () => 0,
    },
    {
      key: 'invert',
      title: 'Invert',
      type: 'boolean',
      generate: () => false,
    },
  ],
  ActuatorPwm: [
    {
      key: 'setting',
      title: 'Duty Setting',
      type: 'number',
      generate: () => 0,
    },
  ],
  // Balancer: [],
  DisplaySettings: [
    {
      key: 'name',
      title: 'Footer text',
      type: 'string',
      generate: () => '',
    },
  ],
  // DS2413: [],
  // Mutex: [],
  Pid: [
    {
      key: 'filterThreshold',
      title: 'Fast step threshold',
      type: 'Unit',
      generate: () => new Unit(2, 'degC'),
    },
    {
      key: 'kp',
      title: 'Kp',
      type: 'Unit',
      generate: () => new Unit(0, 'degC'),
    },
    {
      key: 'ti',
      title: 'Ti',
      type: 'Unit',
      generate: () => new Unit(0, 'second'),
    },
    {
      key: 'td',
      title: 'Td',
      type: 'Unit',
      generate: () => new Unit(0, 'second'),
    },
  ],
  SetpointProfile: [
    {
      key: 'enabled',
      title: 'Enabled',
      type: 'boolean',
      generate: () => true,
    },
  ],
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
  // TempSensorOneWire: [],
};
