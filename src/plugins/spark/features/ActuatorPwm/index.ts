import { unitDurationString } from '@/helpers/functional';
import { Link, Unit } from '@/helpers/units';
import { interfaceTypes } from '@/plugins/spark/block-types';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector } from '@/plugins/spark/helpers';
import { BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorPwmWidget.vue';
import { typeName } from './getters';
import { ActuatorPwmData } from './types';

const block: BlockSpec<ActuatorPwmData> = {
  id: typeName,
  generate: () => ({
    actuatorId: new Link(null, interfaceTypes.ActuatorDigital),
    drivenActuatorId: new Link(null, interfaceTypes.ActuatorDigital, true),
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
      key: 'desiredSetting',
      title: 'Duty Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'period',
      title: 'Period',
      component: 'UnitValEdit',
      generate: () => new Unit(4, 'second'),
      pretty: unitDurationString,
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
      generate: () => new Link(null, interfaceTypes.ActuatorDigital),
    },
  ],
  graphTargets: {
    setting: 'Duty Setting',
    value: 'Duty Achieved',
  },
};

const feature: WidgetFeature = {
  ...genericBlockFeature,
  id: typeName,
  title: 'PWM',
  role: 'Output',
  component: blockWidgetSelector(widget),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
