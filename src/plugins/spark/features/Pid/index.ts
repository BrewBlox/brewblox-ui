import { unitDurationString } from '@/helpers/functional';
import { Link, Unit } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { userUnitChoices } from '@/plugins/spark/getters';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import { typeName } from './getters';
import widget from './PidWidget.vue';
import { PidData } from './types';


const block: BlockSpec<PidData> = {
  id: typeName,
  generate: () => ({
    inputId: new Link(null, interfaceTypes.SetpointSensorPair),
    outputId: new Link(null, interfaceTypes.ActuatorAnalog),
    inputValue: new Unit(0, 'degC'),
    inputSetting: new Unit(0, 'degC'),
    outputValue: 0,
    outputSetting: 0,
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
    drivenOutputId: new Link(null, interfaceTypes.ActuatorAnalog),
    integralReset: 0,
    boilPointAdjust: new Unit(0, 'delta_degC'),
    boilMinOutput: 0,
    boilModeActive: false,
  }),
  presets: [
    {
      name: 'Fridge cooling compressor (beer constant)',
      generate: () => ({
        kp: new Unit(-50, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
      }),
    },
    {
      name: 'Fridge heating element (beer constant)',
      generate: () => ({
        kp: new Unit(100, '1/degC'),
        ti: new Unit(6, 'hour'),
        td: new Unit(30, 'min'),
      }),
    },
    {
      name: 'Fridge cooling compressor (fridge constant)',
      generate: () => ({
        kp: new Unit(-50, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(10, 'min'),
      }),
    },
    {
      name: 'Fridge heating element (fridge constant)',
      generate: () => ({
        kp: new Unit(20, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(10, 'min'),
      }),
    },
    {
      name: 'Kettle heating element',
      generate: () => ({
        kp: new Unit(50, '1/degC'),
        ti: new Unit(10, 'min'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'HLT setpoint driver',
      generate: () => ({
        kp: new Unit(1, '1/degC'),
        ti: new Unit(10, 'min'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'Fridge setpoint driver',
      generate: () => ({
        kp: new Unit(5, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'Glycol pump',
      generate: () => ({
        kp: new Unit(-5, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'Heating pad',
      generate: () => ({
        kp: new Unit(30, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(0, 'min'),
      }),
    },
  ],
  changes: [
    {
      key: 'kp',
      title: 'Kp',
      component: 'UnitValEdit',
      componentProps: { units: ['1/degC', '1/degF', '1/degK'] },
      generate: () => new Unit(0, '1/degC'),
    },
    {
      key: 'ti',
      title: 'Ti',
      component: 'TimeUnitValEdit',
      generate: () => new Unit(0, 'second'),
      pretty: unitDurationString,
    },
    {
      key: 'td',
      title: 'Td',
      component: 'TimeUnitValEdit',
      generate: () => new Unit(0, 'second'),
      pretty: unitDurationString,
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
      generate: () => new Link(null, interfaceTypes.SetpointSensorPair),
    },
    {
      key: 'outputId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null, interfaceTypes.ActuatorAnalog),
    },
  ],
  graphTargets: {
    inputSetting: 'Input target',
    inputValue: 'Input value',
    error: 'Error',
    derivative: 'Derivative of input',
    integral: 'Integral of error',
    p: 'P',
    i: 'I',
    d: 'D',
    outputSetting: 'Output target (P+I+D)',
    outputValue: 'Output value',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'PID',
  role: 'Control',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
