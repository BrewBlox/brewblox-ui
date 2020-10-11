import { unitDurationString } from '@/helpers/functional';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, serviceTemp } from '@/plugins/spark/helpers';
import { BlockSpec, PidBlock } from '@/plugins/spark/types';
import { Link, Temp, Unit } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './PidWidget.vue';

const typeName = 'Pid';

const block: BlockSpec<PidBlock> = {
  id: typeName,
  generate: (serviceId: string | null) => {
    const temp = serviceTemp(serviceId);
    return {
      inputId: new Link(null, 'SetpointSensorPairInterface'),
      outputId: new Link(null, 'ActuatorAnalogInterface'),
      inputValue: new Temp(0, temp),
      inputSetting: new Temp(0, temp),
      outputValue: 0,
      outputSetting: 0,
      enabled: false,
      active: true,
      kp: new Unit(20, `1/${temp}`),
      ti: new Unit(2, 'hour'),
      td: new Unit(0, 'second'),
      p: 0,
      i: 0,
      d: 0,
      error: new Temp(0, `delta_${temp}`),
      integral: new Unit(0, `delta_${temp}/second`),
      derivative: new Unit(0, `delta_${temp}*second`),
      drivenOutputId: new Link(null, 'ActuatorAnalogInterface'),
      integralReset: 0,
      boilPointAdjust: new Unit(0, `delta_${temp}`),
      boilMinOutput: 0,
      boilModeActive: false,
    };
  },
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
      generate: serviceId => new Unit(0, `1/${serviceTemp(serviceId)}`),
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
      generate: () => new Link(null, 'SetpointSensorPairInterface'),
    },
    {
      key: 'outputId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new Link(null, 'ActuatorAnalogInterface'),
    },
    {
      key: 'inputSetting',
      title: 'Input target',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'inputValue',
      title: 'Input value',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(20, 'degC').convert(serviceTemp(serviceId)),
      readonly: true,
      graphed: true,
    },
    {
      key: 'error',
      title: 'Error',
      component: 'UnitValEdit',
      generate: serviceId => new Temp(0, `delta_${serviceTemp(serviceId)}`),
      readonly: true,
      graphed: true,
    },
    {
      key: 'derivative',
      title: 'Derivative of input',
      component: 'UnitValEdit',
      generate: serviceId => new Unit(20, `delta_${serviceTemp(serviceId)}*second`),
      readonly: true,
      graphed: true,
    },
    {
      key: 'integral',
      title: 'Integral of error',
      component: 'UnitValEdit',
      generate: serviceId => new Unit(20, `delta_${serviceTemp(serviceId)}/second`),
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
