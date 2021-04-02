import {
  bloxLink,
  bloxQty,
  deltaTempMultHourQty,
  deltaTempPerMinuteQty,
  deltaTempQty,
  inverseTempQty,
  tempQty,
} from '@/helpers/bloxfield';
import { durationString } from '@/helpers/duration';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockIntfType, BlockSpec, BlockType, FilterChoice, PidBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './PidWidget.vue';

const typeName = BlockType.Pid;

const block: BlockSpec<PidBlock> = {
  id: typeName,
  generate: () => ({
    inputId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
    outputId: bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
    inputValue: tempQty(0),
    inputSetting: tempQty(0),
    outputValue: 0,
    outputSetting: 0,
    enabled: false,
    active: true,
    kp: inverseTempQty(20),
    ti: bloxQty('2h'),
    td: bloxQty('0s'),
    p: 0,
    i: 0,
    d: 0,
    error: deltaTempQty(0),
    integral: deltaTempMultHourQty(0),
    derivative: deltaTempPerMinuteQty(0),
    derivativeFilter: FilterChoice.FILTER_NONE,
    drivenOutputId: bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
    integralReset: 0,
    boilPointAdjust: deltaTempQty(0),
    boilMinOutput: 0,
    boilModeActive: false,
  }),
  presets: [
    {
      name: 'Fridge cooling compressor (beer constant)',
      generate: () => ({
        k: inverseTempQty(-50),
        ti: bloxQty('6h'),
        td: bloxQty('30m'),
      }),
    },
    {
      name: 'Fridge heating element (beer constant)',
      generate: () => ({
        kp: inverseTempQty(100),
        ti: bloxQty('6h'),
        td: bloxQty('30m'),
      }),
    },
    {
      name: 'Fridge cooling compressor (fridge constant)',
      generate: () => ({
        k: inverseTempQty(-50),
        ti: bloxQty('2h'),
        td: bloxQty('10m'),
      }),
    },
    {
      name: 'Fridge heating element (fridge constant)',
      generate: () => ({
        k: inverseTempQty(20),
        ti: bloxQty('2h'),
        td: bloxQty('10m'),
      }),
    },
    {
      name: 'Kettle heating element',
      generate: () => ({
        k: inverseTempQty(50),
        ti: bloxQty('10m'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'HLT setpoint driver',
      generate: () => ({
        k: inverseTempQty(1),
        ti: bloxQty('10m'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'Fridge setpoint driver',
      generate: () => ({
        k: inverseTempQty(5),
        ti: bloxQty('2h'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'Glycol pump',
      generate: () => ({
        k: inverseTempQty(-5),
        ti: bloxQty('2h'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'Heating pad',
      generate: () => ({
        k: inverseTempQty(100),
        ti: bloxQty('2h'),
        td: bloxQty('10m'),
      }),
    },
  ],
  fields: [
    {
      key: 'kp',
      title: 'Kp',
      component: 'QuantityValEdit',
      generate: () => inverseTempQty(0),
    },
    {
      key: 'ti',
      title: 'Ti',
      component: 'DurationValEdit',
      generate: () => bloxQty('0s'),
      pretty: durationString,
    },
    {
      key: 'td',
      title: 'Td',
      component: 'DurationValEdit',
      generate: () => bloxQty('0s'),
      pretty: durationString,
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
      generate: () => bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
    },
    {
      key: 'outputId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
    },
    {
      key: 'inputSetting',
      title: 'Input target',
      component: 'QuantityValEdit',
      generate: () => tempQty(20),
      readonly: true,
      graphed: true,
    },
    {
      key: 'inputValue',
      title: 'Input value',
      component: 'QuantityValEdit',
      generate: () => tempQty(20),
      readonly: true,
      graphed: true,
    },
    {
      key: 'error',
      title: 'Error',
      component: 'QuantityValEdit',
      generate: () => deltaTempQty(0),
      readonly: true,
      graphed: true,
    },
    {
      key: 'integral',
      title: 'Integral of error',
      component: 'QuantityValEdit',
      generate: () => deltaTempMultHourQty(1),
      readonly: true,
      graphed: true,
    },
    {
      key: 'derivative',
      title: 'Derivative of input',
      component: 'QuantityValEdit',
      generate: () => deltaTempPerMinuteQty(1),
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
