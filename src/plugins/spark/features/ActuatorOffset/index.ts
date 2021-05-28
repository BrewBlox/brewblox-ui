import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  AnalogConstraintsObj,
  BlockIntfType,
  BlockSpec,
  BlockType,
  ReferenceKind,
} from '@/plugins/spark/types';
import { blockWidgetSelector, prettifyConstraints } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/bloxfield';

import widget from './ActuatorOffsetWidget.vue';

const typeName = BlockType.ActuatorOffset;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<ActuatorOffsetBlock> = {
      id: typeName,
      generate: () => ({
        targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        drivenTargetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface, true),
        referenceId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        referenceSettingOrValue: ReferenceKind.REF_SETTING,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
        enabled: true,
      }),
      fieldSpecs: [
        {
          key: 'desiredSetting',
          title: 'Target offset',
          component: 'NumberValEdit',
          generate: () => 0,
          valueHint: 'degC or %, depending on target',
        },
        {
          key: 'enabled',
          title: 'Enabled',
          component: 'BoolValEdit',
          generate: () => true,
        },
        {
          key: 'targetId',
          title: 'Target',
          component: 'LinkValEdit',
          generate: () => bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        },
        {
          key: 'referenceId',
          title: 'Reference',
          component: 'LinkValEdit',
          generate: () => bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
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
          title: 'Target offset',
          component: 'NumberValEdit',
          generate: () => 0,
          valueHint: 'number',
          readonly: true,
          graphed: true,
        },
        {
          key: 'value',
          title: 'Actual offset',
          component: 'NumberValEdit',
          generate: () => 0,
          valueHint: 'number',
          readonly: true,
          graphed: true,
        },
      ],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Setpoint Driver',
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
