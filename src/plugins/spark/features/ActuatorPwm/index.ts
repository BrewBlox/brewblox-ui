import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { ActuatorPwmBlock, AnalogConstraintsObj, BlockIntfType, BlockSpec, BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink, bloxQty } from '@/utils/bloxfield';
import { durationString } from '@/utils/duration';

import widget from './ActuatorPwmWidget.vue';

const typeName = BlockType.ActuatorPwm;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<ActuatorPwmBlock> = {
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
      fieldSpecs: [
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
          component: 'DurationValEdit',
          generate: () => bloxQty('4s'),
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
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
