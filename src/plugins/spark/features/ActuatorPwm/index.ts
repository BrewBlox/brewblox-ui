import { ref } from '@/helpers/component-ref';
import { Link, Unit } from '@/helpers/units';
import { ActuatorDigitalLink } from '@/helpers/units/KnownLinks';
import GenericBlock from '@/plugins/spark/components/GenericBlock';
import { Feature } from '@/store/features';

import { BlockSpec } from '../../types';
import form from './ActuatorPwmForm.vue';
import widget from './ActuatorPwmWidget.vue';
import { typeName } from './getters';
import { ActuatorPwmData } from './types';

const block: BlockSpec = {
  id: typeName,
  generate: (): ActuatorPwmData => ({
    actuatorId: new ActuatorDigitalLink(null),
    drivenActuatorId: new ActuatorDigitalLink(null, true),
    period: new Unit(4, 'second'),
    desiredSetting: 0,
    setting: 0,
    value: 0,
    constrainedBy: { constraints: [] },
    enabled: true,
  }),
  presets: [
    {
      name: 'Heater - 4s period',
      generate: () => ({
        period: new Unit(4, 'second'),
      }),
    },
    {
      name: 'Fridge - 30m period',
      generate: () => ({
        period: new Unit(1800, 'second'),
      }),
    },
  ],
  changes: [
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
};

const feature: Feature = {
  ...GenericBlock,
  id: typeName,
  displayName: 'PWM',
  role: 'Output',
  widget: ref(widget),
  form: ref(form),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
