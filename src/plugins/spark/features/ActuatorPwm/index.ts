import { qtyDurationString } from '@/helpers/functional';
import { Link, Qty, Time } from '@/plugins/spark/bloxfield';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { ActuatorPwmBlock, AnalogConstraintsObj, BlockIntfType, BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorPwmWidget.vue';

const typeName = 'ActuatorPwm';

const block: BlockSpec<ActuatorPwmBlock> = {
  id: typeName,
  generate: () => ({
    actuatorId: new Link(null, BlockIntfType.ActuatorDigitalInterface),
    drivenActuatorId: new Link(null, BlockIntfType.ActuatorDigitalInterface, true),
    period: new Qty(4, 'second'),
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
        period: new Qty(4, 'second'),
      }),
    },
    {
      name: 'Fridge - 30m period',
      generate: () => ({
        period: new Qty(1800, 'second'),
      }),
    },
  ],
  fields: [
    {
      key: 'desiredSetting',
      title: 'Duty Setting',
      component: 'NumberValEdit',
      generate: () => 0,
      valueHint: '0-100',
    },
    {
      key: 'period',
      title: 'Period',
      component: 'TimeUnitValEdit',
      generate: () => new Time(4, 'second'),
      pretty: qtyDurationString,
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
      generate: () => new Link(null, BlockIntfType.ActuatorDigitalInterface),
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
      valueHint: '0-100',
      readonly: true,
      graphed: true,
    },
    {
      key: 'value',
      title: 'Duty Achieved',
      component: 'NumberValEdit',
      generate: () => 0,
      valueHint: '0-100',
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
