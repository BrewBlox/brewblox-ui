import {
  defaultLabel,
  nodeBuilder,
  targetBuilder,
  targetSplitter,
} from '../nodes';
import { QueryTarget } from '../types';

const targets = (): QueryTarget[] => [
  {
    measurement: 'sparkey',
    fields: ['actuator-pwm-1/setting', 'actuator-pwm-1/value'],
  },
  {
    measurement: 'spock',
    fields: [' Combined Influx points'],
  },
];

const flatFields = (): string[] => [
  'sparkey/actuator-pwm-1/setting',
  'sparkey/actuator-pwm-1/value',
  'spock/ Combined Influx points',
];

const groupedFields = (): Mapped<string[]> => ({
  sparkey: ['actuator-pwm-1/setting', 'actuator-pwm-1/value'],
  spock: [
    ' Combined Influx points',
    'Ferment Cool PID/p',
    'Ferment Cool PWM/desiredSetting',
  ],
});

const knownFields = (): Mapped<string[]> => ({
  sparkey: [
    'actuator-pwm-1/setting',
    'actuator-pwm-1/value',
    'HERMS MT PID/d',
    'Logic Actuator/result',
    'Logic Input 1/desiredState',
    'Logic Input 1/state',
    'Logic Input 2/desiredState',
    'Logic Input 2/state',
  ],
  spock: [
    ' Combined Influx points',
    'Ferment Cool PID/p',
    'Ferment Cool PWM/desiredSetting',
    'Ferment Cool PWM/setting',
    'Ferment Cool PWM/value',
    'Ferment Fridge Sensor/connected',
    'Ferment Heat PID/p',
  ],
});

const nodes = (): QuasarNode[] => [
  {
    label: 'sparkey',
    title: '',
    value: 'sparkey',
    children: [
      {
        label: 'actuator-pwm-1',
        title: '',
        value: 'sparkey/actuator-pwm-1',
        children: [
          {
            label: 'Setting',
            title: '[actuator-pwm-1] Setting',
            value: 'sparkey/actuator-pwm-1/setting',
            selectable: true,
          },
          {
            label: 'Value',
            value: 'sparkey/actuator-pwm-1/value',
            title: '[actuator-pwm-1] Value',
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    label: 'spock',
    title: '',
    value: 'spock',
    children: [
      {
        label: 'Combined influx points',
        title: 'Combined influx points',
        value: 'spock/ Combined Influx points',
        selectable: true,
      },
      {
        label: 'Ferment Cool PID',
        title: '',
        value: 'spock/Ferment Cool PID',
        children: [
          {
            label: 'P',
            title: '[Ferment Cool PID] P',
            value: 'spock/Ferment Cool PID/p',
            selectable: true,
          },
        ],
      },
      {
        label: 'Ferment Cool PWM',
        title: '',
        value: 'spock/Ferment Cool PWM',
        children: [
          {
            label: 'Desired setting',
            title: '[Ferment Cool PWM] Desired setting',
            value: 'spock/Ferment Cool PWM/desiredSetting',
            selectable: true,
          },
        ],
      },
    ],
  },
];

describe('Targets and fields', () => {
  it('should split targets into fields', () => {
    expect(targetSplitter(targets())).toMatchObject(flatFields());
  });
  it('should build fields into targets', () => {
    expect(targetBuilder(flatFields(), knownFields())).toMatchObject(targets());
    expect(
      targetBuilder([...flatFields(), 'leftovers'], knownFields()),
    ).toMatchObject(targets());
  });
});

describe('Node labels', () => {
  it('should generate default labels', () => {
    expect(defaultLabel('spock/ Combined Influx points')).toEqual(
      'Combined influx points',
    );
    expect(defaultLabel('sparkey/actuator-pwm-1/setting[1/degC]')).toEqual(
      '[actuator-pwm-1] Setting /°C',
    );
    expect(defaultLabel('single/')).toEqual('');
    expect(defaultLabel('single')).toEqual('');
  });
});

describe('Building nodes', () => {
  it('should build quasar nodes', () => {
    expect(nodeBuilder(groupedFields(), { selectable: true })).toMatchObject(
      nodes(),
    );
  });
});
