import { ref } from '@/helpers/component-ref';
import { Link, Unit } from '@/helpers/units';
import { ActuatorAnalogLink, ProcessValueLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './PidForm.vue';
import widget from './PidWidget.vue';
import { typeName } from './getters';
import { PidData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): PidData => ({
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
  }),
  presets: [
    {
      name: 'Fridge compressor: (cooling)',
      generate: () => ({
        filter: 4,
        filterThreshold: new Unit(5, 'delta_degC'),
        kp: new Unit(-10, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(5, 'min'),
      }),
    },
    {
      name: 'Fridge heater',
      generate: () => ({
        filter: 4,
        filterThreshold: new Unit(5, 'delta_degC'),
        kp: new Unit(20, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(3, 'min'),
      }),
    },
    {
      name: 'Kettle heating element',
      generate: () => ({
        filter: 2,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(50, '1/degC'),
        ti: new Unit(10, 'min'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'HLT setpoint driver',
      generate: () => ({
        filter: 2,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(1, '1/degC'),
        ti: new Unit(10, 'min'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'Fridge setpoint driver',
      generate: () => ({
        filter: 4,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(5, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(0, 'min'),
      }),
    },
    {
      name: 'Glycol pump',
      generate: () => ({
        filter: 4,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(-5, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(5, 'min'),
      }),
    },
    {
      name: 'Heating pad',
      generate: () => ({
        filter: 4,
        filterThreshold: new Unit(2, 'delta_degC'),
        kp: new Unit(30, '1/degC'),
        ti: new Unit(2, 'hour'),
        td: new Unit(5, 'min'),
      }),
    },
  ],
  changes: [
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
      generate: () => new ProcessValueLink(null),
    },
    {
      key: 'outputId',
      title: 'Target',
      component: 'LinkValEdit',
      generate: () => new ActuatorAnalogLink(null),
    },
  ],
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'PID',
  role: 'Control',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
