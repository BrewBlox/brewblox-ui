import { bloxLink, bloxQty } from '@/helpers/bloxfield';
import { durationString } from '@/helpers/duration';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockIntfType, BlockSpec, BlockType, FilterChoice, PidBlock } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './PidWidget.vue';

const typeName = BlockType.Pid;

const block: BlockSpec<PidBlock> = {
  id: typeName,
  generate: (serviceId: string | null) => {
    const temp = serviceTemp(serviceId);
    return {
      inputId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
      outputId: bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
      inputValue: bloxQty(0, temp),
      inputSetting: bloxQty(0, temp),
      outputValue: 0,
      outputSetting: 0,
      enabled: false,
      active: true,
      kp: bloxQty(20, `1/${temp}`),
      ti: bloxQty('2h'),
      td: bloxQty('0s'),
      p: 0,
      i: 0,
      d: 0,
      error: bloxQty(0, `delta_${temp}`),
      integral: bloxQty(0, `delta_${temp}*hour`),
      derivative: bloxQty(0, `delta_${temp}/minute`),
      derivativeFilter: FilterChoice.FILTER_NONE,
      drivenOutputId: bloxLink(null, BlockIntfType.ActuatorAnalogInterface),
      integralReset: 0,
      boilPointAdjust: bloxQty(0, `delta_${temp}`),
      boilMinOutput: 0,
      boilModeActive: false,
    };
  },
  presets: [
    {
      name: 'Fridge cooling compressor (beer constant)',
      generate: () => ({
        kp: bloxQty(-50, '1/degC'),
        ti: bloxQty('6h'),
        td: bloxQty('30m'),
      }),
    },
    {
      name: 'Fridge heating element (beer constant)',
      generate: () => ({
        kp: bloxQty(100, '1/degC'),
        ti: bloxQty('6h'),
        td: bloxQty('30m'),
      }),
    },
    {
      name: 'Fridge cooling compressor (fridge constant)',
      generate: () => ({
        kp: bloxQty(-50, '1/degC'),
        ti: bloxQty('2h'),
        td: bloxQty('10m'),
      }),
    },
    {
      name: 'Fridge heating element (fridge constant)',
      generate: () => ({
        kp: bloxQty(20, '1/degC'),
        ti: bloxQty('2h'),
        td: bloxQty('10m'),
      }),
    },
    {
      name: 'Kettle heating element',
      generate: () => ({
        kp: bloxQty(50, '1/degC'),
        ti: bloxQty('10m'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'HLT setpoint driver',
      generate: () => ({
        kp: bloxQty(1, '1/degC'),
        ti: bloxQty('10m'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'Fridge setpoint driver',
      generate: () => ({
        kp: bloxQty(5, '1/degC'),
        ti: bloxQty('2h'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'Glycol pump',
      generate: () => ({
        kp: bloxQty(-5, '1/degC'),
        ti: bloxQty('2h'),
        td: bloxQty('0s'),
      }),
    },
    {
      name: 'Heating pad',
      generate: () => ({
        kp: bloxQty(100, '1/degC'),
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
      generate: serviceId => bloxQty(0, `1/${serviceTemp(serviceId)}`),
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
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'inputValue',
      title: 'Input value',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(20, 'degC').to(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'error',
      title: 'Error',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(0, `delta_${serviceTemp(serviceId)}`),
      readonly: true,
      graphed: true,
    },
    {
      key: 'integral',
      title: 'Integral of error',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(1, `delta_${serviceTemp(serviceId)}*hour`),
      readonly: true,
      graphed: true,
    },
    {
      key: 'derivative',
      title: 'Derivative of input',
      component: 'QuantityValEdit',
      generate: serviceId => bloxQty(1, `delta_${serviceTemp(serviceId)}/minute`),
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
