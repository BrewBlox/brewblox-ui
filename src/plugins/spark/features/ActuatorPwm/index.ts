import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { prettifyConstraints } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { bloxQty, durationString } from '@/utils/quantity';
import {
  ActuatorPwmBlock,
  AnalogConstraintsObj,
  BlockIntfType,
  BlockType,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './ActuatorPwmWidget.vue';

const type = BlockType.ActuatorPwm;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<ActuatorPwmBlock> = {
      type,
      generate: () => ({
        actuatorId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
        drivenActuatorId: bloxLink(
          null,
          BlockIntfType.ActuatorDigitalInterface,
          true,
        ),
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

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
