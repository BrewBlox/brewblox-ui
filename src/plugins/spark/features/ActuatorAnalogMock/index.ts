import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { prettifyConstraints } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import {
  ActuatorAnalogMockBlock,
  AnalogConstraintsObj,
  BlockType,
  SettingMode,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './ActuatorAnalogMockWidget.vue';

const type = BlockType.ActuatorAnalogMock;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<ActuatorAnalogMockBlock> = {
      type,
      generate: (): ActuatorAnalogMockBlock['data'] => ({
        enabled: true,
        storedSetting: 0,
        desiredSetting: 0,
        setting: 0,
        minSetting: 0,
        maxSetting: 100,
        value: 0,
        minValue: 0,
        maxValue: 100,
        constrainedBy: { constraints: [] },
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
      analyze: (block: ActuatorAnalogMockBlock) => {
        const { enabled, setting } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (setting == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<ActuatorAnalogMockBlock>[] = [
      {
        type,
        key: 'storedSetting',
        title: 'Stored setting',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 0,
        graphed: true,
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
        key: 'minSetting',
        title: 'Minimum setting',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 0,
      },
      {
        type,
        key: 'maxSetting',
        title: 'Maximum setting',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 100,
      },
      {
        type,
        key: 'minValue',
        title: 'Minimum value',
        component: 'NumberValEdit',
        valueHint: '0-100',
        generate: () => 0,
      },
      {
        type,
        key: 'maxValue',
        title: 'Maximum value',
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
        key: 'setting',
        title: 'Setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Measured value',
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

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
