import widget from './ActuatorPwmWidget.vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { prettyConstraints } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { bloxQty, durationString } from '@/utils/quantity';
import {
  ActuatorPwmBlock,
  BlockIntfType,
  BlockType,
  SettingMode,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';

const type = BlockType.ActuatorPwm;
const title = 'PWM';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<ActuatorPwmBlock> = {
      type,
      title,
      generate: (): ActuatorPwmBlock['data'] => ({
        actuatorId: bloxLink(null, BlockIntfType.ActuatorDigitalInterface),
        period: bloxQty('4s'),
        storedSetting: 0,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constraints: {},
        enabled: true,
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
      analyze: (block: ActuatorPwmBlock) => {
        const { enabled, setting, actuatorId } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (actuatorId.id == null) {
          return 'Invalid';
        }
        if (setting == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<ActuatorPwmBlock>[] = [
      {
        type,
        key: 'storedSetting',
        title: 'Stored duty setting',
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
        key: 'constraints',
        title: 'Constraints',
        component: 'AnalogConstraintsValEdit',
        generate: () => ({}),
        pretty: prettyConstraints,
      },
      {
        type,
        key: 'desiredSetting',
        title: 'Desired duty setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'setting',
        title: 'Duty setting',
        component: 'NumberValEdit',
        generate: () => 0,
        valueHint: '0-100',
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Duty achieved',
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
      title,
      role: 'Output',
      component: cref(app, widget),
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
