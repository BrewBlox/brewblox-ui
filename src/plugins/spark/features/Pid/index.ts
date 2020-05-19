import { unitDurationString } from '@/helpers/functional';
import { Link, Temp, Unit } from '@/helpers/units';
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
    inputValue: new Temp(0, 'degC'),
    inputSetting: new Temp(0, 'degC'),
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
        kp: new Unit(100, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(10, 'min'),
      }),
    },
  ],
  fields: [
    {
      key: 'kp',
      title: 'Kp',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp.map(v => `1/${v}`) },
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
    {
      key: 'inputSetting',
      title: 'Input target',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Temp(20, 'degC'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'inputValue',
      title: 'Input value',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Temp(20, 'degC'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'error',
      title: 'Error',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp },
      generate: () => new Temp(0, 'degC'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'derivative',
      title: 'Derivative of input',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp.map(v => `delta_${v}*second`) },
      generate: () => new Unit(0, 'delta_degC*second'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'integral',
      title: 'Integral of error',
      component: 'UnitValEdit',
      componentProps: { units: userUnitChoices.Temp.map(v => `delta_${v}/second`) },
      generate: () => new Unit(0, 'delta_degC/second'),
      readonly: true,
      graphed: true,
    },
    {
      key: 'p',
      title: 'P',
      component: 'NumberValEdit',
      generate: () => 0,
      readonly: true,
      graphed: true,
    },
    {
      key: 'i',
      title: 'I',
      component: 'NumberValEdit',
      generate: () => 0,
      readonly: true,
      graphed: true,
    },
    {
      key: 'd',
      title: 'D',
      component: 'NumberValEdit',
      generate: () => 0,
      readonly: true,
      graphed: true,
    },
    {
      key: 'outputSetting',
      title: 'Output target (P+I+D)',
      component: 'NumberValEdit',
      generate: () => 0,
      readonly: true,
      graphed: true,
    },
    {
      key: 'outputValue',
      title: 'Output value',
      component: 'NumberValEdit',
      generate: () => 0,
      readonly: true,
      graphed: true,
    },
  ],
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
