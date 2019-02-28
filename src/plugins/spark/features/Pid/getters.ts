import { blockById } from '@/plugins/spark/store/getters';
import { RootStore } from '@/store/state';
import { PidBlock } from './state';
import { ProcessValueLink, ActuatorAnalogLink } from '@/helpers/units/KnownLinks';
import { Unit } from '@/helpers/units';

export const typeName = 'Pid';

export const filters = [
  '30s',
  '1m',
  '3m',
  '5m',
  '10m',
  '20m',
  '45m',
];

export const getById =
  (store: RootStore, serviceId: string, id: string): PidBlock =>
    blockById<PidBlock>(store, serviceId, id, typeName);

export const defaultData =
  (): any => ({
    inputId: new ProcessValueLink(null),
    outputId: new ActuatorAnalogLink(null),
    inputValue: new Unit(0, 'degC'),
    inputSetting: new Unit(0, 'degC'),
    outputValue: 0,
    outputSetting: 0,
    filter: 4,
    filterThreshold: new Unit(5, 'delta_degC'),
    enabled: false,
    active: true,
    kp: new Unit(20, '1/degC'),
    ti: new Unit(2, 'hour'),
    td: new Unit(0, 'second'),
    p: 0,
    i: 0,
    d: 0,
    error: new Unit(0, 'delta_degC'),
    integral: new Unit(0, 'delta_degC/second'),
    derivative: new Unit(0, 'delta_degC*second'),
  });

export const presets =
  (): any[] => ([
    {
      label: 'Fridge compressor (cooling)',
      value: {
        filter: 4,
        filterThreshold: new Unit(5, 'delta_degC'),
        kp: new Unit(-10, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(5, 'min'),
      },
    },
    {
      label: 'Fridge heater',
      value: {
        filter: 4,
        filterThreshold: new Unit(5, 'delta_degC'),
        kp: new Unit(20, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(3, 'min'),
      },
    },
    {
      label: 'Kettle heating element',
      value: {
        filter: 2,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(50, '1/degC'),
        ti: new Unit(10, 'min'),
        td: new Unit(0, 'min'),
      },
    },
    {
      label: 'HLT setpoint driver',
      value: {
        filter: 2,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(1, '1/degC'),
        ti: new Unit(10, 'min'),
        td: new Unit(0, 'min'),
      },
    },
    {
      label: 'Fridge setpoint driver',
      value: {
        filter: 4,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(5, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(0, 'min'),
      },
    },
    {
      label: 'Glycol pump',
      value: {
        filter: 4,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(-5, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(5, 'min'),
      },
    },
    {
      label: 'Heating pad',
      value: {
        filter: 4,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(30, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(5, 'min'),
      },
    },
  ]);
