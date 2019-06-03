import { Link, Unit } from '@/helpers/units';

import { ChangeProperty } from './types';

export const changeProps: Record<string, ChangeProperty[]> = {
  ActuatorAnalogMock: [
    {
      key: 'setting',
      title: 'Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'minSetting',
      title: 'Minimum Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'maxSetting',
      title: 'Maximum Setting',
      component: 'NumberValEdit',
      generate: () => 100,
    },
    {
      key: 'minValue',
      title: 'Minimum Value',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'maxValue',
      title: 'Maximum Value',
      component: 'NumberValEdit',
      generate: () => 100,
    },
  ],
  ActuatorDS2413: [
    {
      key: 'state',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 0,
    },
    {
      key: 'invert',
      title: 'Invert',
      component: 'BoolValEdit',
      generate: () => false,
    },
  ],
  ActuatorOffset: [
    {
      key: 'setting',
      title: 'Target offset',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'enabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'targetId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
    {
      key: 'referenceId',
      title: 'Reference',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
  ],
  ActuatorPin: [
    {
      key: 'state',
      title: 'State',
      component: 'StateValEdit',
      generate: () => 0,
    },
    {
      key: 'invert',
      title: 'Invert',
      component: 'BoolValEdit',
      generate: () => false,
    },
  ],
  ActuatorPwm: [
    {
      key: 'setting',
      title: 'Duty Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'period',
      title: 'Period',
      component: 'UnitValEdit',
      generate: () => new Unit(4, 'second'),
    },
    {
      key: 'enabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'actuatorId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
  ],
  // Balancer: [],
  DisplaySettings: [
    {
      key: 'name',
      title: 'Footer text',
      component: 'StringValEdit',
      generate: () => '',
    },
  ],
  // DS2413: [],
  // Mutex: [],
  Pid: [
    {
      key: 'filterThreshold',
      title: 'Fast step threshold',
      component: 'UnitValEdit',
      generate: () => new Unit(2, 'degC'),
    },
    {
      key: 'kp',
      title: 'Kp',
      component: 'UnitValEdit',
      generate: () => new Unit(0, 'degC'),
    },
    {
      key: 'ti',
      title: 'Ti',
      component: 'UnitValEdit',
      generate: () => new Unit(0, 'second'),
    },
    {
      key: 'td',
      title: 'Td',
      component: 'UnitValEdit',
      generate: () => new Unit(0, 'second'),
    },
    {
      key: 'enabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'inputId',
      title: 'Input',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
    {
      key: 'outputId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
  ],
  SetpointProfile: [
    {
      key: 'enabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'start',
      title: 'Start Time',
      component: 'DateValEdit',
      componentProps: { timeScale: 1000 },
      generate: () => new Date().getTime(),
    },
    {
      key: 'targetId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
  ],
  SetpointSensorPair: [
    {
      key: 'storedSetting',
      title: 'Setting',
      component: 'UnitValEdit',
      generate: () => new Unit(20, 'degC'),
    },
    {
      key: 'settingEnabled',
      title: 'Enabled',
      component: 'BoolValEdit',
      generate: () => true,
    },
    {
      key: 'sensorId',
      title: 'Linked Sensor',
      component: 'LinkValEdit',
      generate: () => new Link(null),
    },
  ],
  TempSensorMock: [
    {
      key: 'value',
      title: 'Sensor Value',
      component: 'UnitValEdit',
      generate: () => new Unit(20, 'degC'),
    },
    {
      key: 'connected',
      title: 'Connected',
      component: 'BoolValEdit',
      generate: () => true,
    },
  ],
  // TempSensorOneWire: [],
};
