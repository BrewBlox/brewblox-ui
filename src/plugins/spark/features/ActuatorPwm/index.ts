import { unitDurationString } from '@/helpers/functional';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { interfaceTypes } from '@/plugins/spark/getters';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { ActuatorPwmBlock, AnalogConstraintsObj, BlockSpec } from '@/plugins/spark/types';
import { Link, Time, Unit } from '@/plugins/spark/units';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorPwmWidget.vue';

const typeName = 'ActuatorPwm';

const block: BlockSpec<ActuatorPwmBlock> = {
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
  fields: [
    {
      key: 'desiredSetting',
      title: 'Duty Setting',
      component: 'NumberValEdit',
      generate: () => 0,
    },
    {
      key: 'period',
      title: 'Period',
      component: 'TimeUnitValEdit',
      generate: () => new Time(4, 's'),
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
    {
      key: 'constrainedBy',
      title: 'Constraints',
      component: 'AnalogConstraintsValEdit',
      generate: (): AnalogConstraintsObj => ({ constraints: [] }),
      pretty: prettifyConstraints,
    },
    {
      key: 'setting',
      title: 'Duty Setting',
      component: 'NumberValEdit',
      generate: () => 0,
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Duty Achieved',
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
  title: 'PWM',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 3,
  },
};

export default { feature, block };
