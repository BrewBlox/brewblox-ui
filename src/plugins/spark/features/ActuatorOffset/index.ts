import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { prettifyConstraints } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { deltaTempQty } from '@/utils/quantity';
import {
  ActuatorOffsetBlock,
  AnalogConstraintsObj,
  BlockIntfType,
  BlockType,
  ReferenceKind,
  SettingMode,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './ActuatorOffsetWidget.vue';

const type = BlockType.ActuatorOffset;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<ActuatorOffsetBlock> = {
      type,
      generate: (): ActuatorOffsetBlock['data'] => ({
        targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        referenceId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        referenceSettingOrValue: ReferenceKind.REF_SETTING,
        storedSetting: deltaTempQty(0),
        desiredSetting: deltaTempQty(null),
        setting: deltaTempQty(null),
        value: deltaTempQty(null),
        constrainedBy: { constraints: [] },
        enabled: true,
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
    };

    const fieldSpecs: BlockFieldSpec<ActuatorOffsetBlock>[] = [
      {
        type,
        key: 'storedSetting',
        title: 'Stored offset',
        component: 'QuantityValEdit',
        generate: () => deltaTempQty(0),
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
        key: 'desiredSetting',
        title: 'Desired offset',
        component: 'QuantityValEdit',
        generate: () => deltaTempQty(0),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'setting',
        title: 'Actual setting',
        component: 'QuantityValEdit',
        generate: () => deltaTempQty(0),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Achieved offset',
        component: 'QuantityValEdit',
        generate: () => deltaTempQty(0),
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
