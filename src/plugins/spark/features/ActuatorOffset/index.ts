import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  ActuatorOffsetBlock,
  AnalogConstraintsObj,
  BlockFieldSpec,
  BlockIntfType,
  BlockSpec,
  BlockType,
  ReferenceKind,
} from '@/plugins/spark/types';
import {
  blockWidgetSelector,
  prettifyConstraints,
} from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';

import widget from './ActuatorOffsetWidget.vue';

const type = BlockType.ActuatorOffset;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<ActuatorOffsetBlock> = {
      type,
      generate: () => ({
        targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        drivenTargetId: bloxLink(
          null,
          BlockIntfType.SetpointSensorPairInterface,
          true,
        ),
        referenceId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        referenceSettingOrValue: ReferenceKind.REF_SETTING,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
        enabled: true,
      }),
    };

    const fieldSpecs: BlockFieldSpec<ActuatorOffsetBlock>[] = [
      {
        type,
        key: 'desiredSetting',
        title: 'Target offset',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: 'degC or %, depending on target',
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
        key: 'targetId',
        title: 'Target',
        component: 'LinkValEdit',
        generate: () =>
          bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
      },
      {
        type,
        key: 'referenceId',
        title: 'Reference',
        component: 'LinkValEdit',
        generate: () =>
          bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
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
        title: 'Target offset',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: 'number',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Actual offset',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: 'number',
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Setpoint Driver',
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
