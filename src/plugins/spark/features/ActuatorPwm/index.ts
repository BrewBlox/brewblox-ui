import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorPwmBlock,
  AnalogConstraintsObj,
  BlockFieldSpec,
  BlockIntfType,
  BlockSpec,
  BlockType,
} from '@/plugins/spark/types';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink, bloxQty } from '@/utils/bloxfield';
import { durationString } from '@/utils/duration';

import widget from './ActuatorPwmWidget.vue';

const type = BlockType.ActuatorPwm;

const plugin: Plugin = {
  install(app) {

    const blockSpec: BlockSpec<ActuatorPwmBlock> = {
      type,
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
    };

    const fieldSpecs: BlockFieldSpec<ActuatorPwmBlock>[] = [
      {
        type,
        key: 'desiredSetting',
        title: 'Duty Setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
      },
      {
        type,
        key: 'period',
        title: 'Period',
        component: 'DurationValEdit',
        generate: () => bloxQty('4s'),
        pretty: durationString,
      },
      {
        type,
        key: 'enabled',
        title: 'Enabled',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'actuatorId',
        title: 'Target',
        component: 'LinkValEdit',
        generate: () => bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
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
        key: 'setting',
        title: 'Duty Setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Duty Achieved',
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
      title: 'PWM',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    sparkStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
