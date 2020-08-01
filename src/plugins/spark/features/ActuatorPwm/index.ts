import { bloxLink, bloxQty } from '@/helpers/bloxfield';
import { durationString } from '@/helpers/duration';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { ActuatorPwmBlock, AnalogConstraintsObj, BlockIntfType, BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorPwmWidget.vue';

const typeName = 'ActuatorPwm';

const block: BlockSpec<ActuatorPwmBlock> = {
  id: typeName,
  generate: () => ({
    actuatorId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
    drivenActuatorId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface, true),
    period: bloxQty('4s'),
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
        period: bloxQty('4s'),
      }),
    },
    {
      name: 'Fridge - 30m period',
      generate: () => ({
        period: bloxQty('30m'),
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
      component: 'DurationQuantityValEdit',
      generate: () => bloxQty(4, 'second'),
      pretty: durationString,
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
      generate: () => bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
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
