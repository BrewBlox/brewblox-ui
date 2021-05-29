import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorAnalogMockBlock,
  AnalogConstraintsObj,
  BlockFieldSpec,
  BlockSpec,
  BlockType,
} from '@/plugins/spark/types';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './ActuatorAnalogMockWidget.vue';
const type = BlockType.ActuatorAnalogMock;

const plugin: Plugin = {
  install(app) {
    const blockSpec: BlockSpec<ActuatorAnalogMockBlock> = {
      type,
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
    };

    const fieldSpecs: BlockFieldSpec<ActuatorAnalogMockBlock>[] = [
      {
        type,
        key: 'desiredSetting',
        title: 'Setting',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 0,
        graphed: true,
      },
      {
        type,
        key: 'minSetting',
        title: 'Minimum Setting',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 0,
      },
      {
        type,
        key: 'maxSetting',
        title: 'Maximum Setting',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 100,
      },
      {
        type,
        key: 'minValue',
        title: 'Minimum Value',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 0,
      },
      {
        type,
        key: 'maxValue',
        title: 'Maximum Value',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 100,
      },
      {
        type,
        key: 'constrainedBy',
        title: 'Constraints',
        component: 'AnalogConstraintsValEdit',
        generate: (): AnalogConstraintsObj => ({ constraints: [] }),
        pretty: prettifyConstraints,
      },
      {
        type,
        key: 'value',
        title: 'Measured Value',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Analog Actuator (Mock)',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    sparkStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
