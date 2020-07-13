import { genericBlockFeature } from '@/plugins/spark/generic';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/helpers';
import { ActuatorAnalogMockBlock, AnalogConstraintsObj, BlockSpec } from '@/plugins/spark/types';
import { WidgetFeature } from '@/store/features';

import widget from './ActuatorAnalogMockWidget.vue';
const typeName = 'ActuatorAnalogMock';

const block: BlockSpec<ActuatorAnalogMockBlock> = {
  id: typeName,
  generate: () => ({
    setting: 0,
    desiredSetting: 0,
    minSetting: 0,
    maxSetting: 100,
    value: 0,
    minValue: 0,
    maxValue: 100,
    constrainedBy: { constraints: [] },
  }),
  fields: [
    {
      key: 'desiredSetting',
      title: 'Setting',
      component: 'NumberValEdit',
      valueHint: '0-100',
      generate: () => 0,
      graphed: true,
    },
    {
      key: 'minSetting',
      title: 'Minimum Setting',
      component: 'NumberValEdit',
      valueHint: '0-100',
      generate: () => 0,
    },
    {
      key: 'maxSetting',
      title: 'Maximum Setting',
      component: 'NumberValEdit',
      valueHint: '0-100',
      generate: () => 100,
    },
    {
      key: 'minValue',
      title: 'Minimum Value',
      component: 'NumberValEdit',
      valueHint: '0-100',
      generate: () => 0,
    },
    {
      key: 'maxValue',
      title: 'Maximum Value',
      component: 'NumberValEdit',
      valueHint: '0-100',
      generate: () => 100,
    },
    {
      key: 'constrainedBy',
      title: 'Constraints',
      component: 'AnalogConstraintsValEdit',
      generate: (): AnalogConstraintsObj => ({ constraints: [] }),
      pretty: prettifyConstraints,
    },
    {
      key: 'value',
      title: 'Measured Value',
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
  title: 'Analog Actuator (Mock)',
  role: 'Output',
  component: blockWidgetSelector(widget, typeName),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export const blockStuff = {};

export default { feature, block };
