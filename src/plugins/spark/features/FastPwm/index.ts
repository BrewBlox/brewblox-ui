import {
  BlockIntfType,
  BlockType,
  FastPwmBlock,
  PwmFrequency,
  SettingMode,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { enumHint, prettyConstraints } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import widget from './FastPwmWidget.vue';

const type = BlockType.FastPwm;
const title = 'Fast PWM';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<FastPwmBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): FastPwmBlock['data'] => ({
        enabled: true,
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
        channel: 0,
        invert: false,
        frequency: PwmFrequency.PWM_FREQ_100HZ,
        storedSetting: 0,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constraints: {},
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
      analyze: (block: FastPwmBlock) => {
        const { enabled, hwDevice, channel, setting } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (hwDevice.id == null || channel == 0) {
          return 'Invalid';
        }
        if (setting == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<FastPwmBlock>[] = [
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
        key: 'frequency',
        title: 'Frequency',
        component: 'EnumValEdit',
        componentProps: { options: PwmFrequency },
        generate: () => PwmFrequency.PWM_FREQ_80HZ,
        valueHint: enumHint(PwmFrequency),
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
