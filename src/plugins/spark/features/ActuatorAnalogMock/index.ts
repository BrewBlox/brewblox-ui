import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { ActuatorAnalogMockBlock, AnalogConstraintsObj, BlockSpec, BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './ActuatorAnalogMockWidget.vue';
const typeName = BlockType.ActuatorAnalogMock;

const plugin: Plugin = {
  install(app) {
    const spec: BlockSpec<ActuatorAnalogMockBlock> = {
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
      fieldSpecs: [
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
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
