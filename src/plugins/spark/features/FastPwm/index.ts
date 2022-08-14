import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import {
  enumHint,
  prettifyConstraints,
} from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import {
  AnalogConstraintsObj,
  BlockIntfType,
  BlockType,
  FastPwmBlock,
  PwmFrequency,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './FastPwmWidget.vue';

const type = BlockType.FastPwm;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<FastPwmBlock> = {
      type,
      generate: (): FastPwmBlock['data'] => ({
        enabled: true,
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
        channel: 0,
        invert: false,
        frequency: PwmFrequency.PWM_FREQ_80HZ,
        desiredSetting: 0,
        setting: 0,
        value: 0,
        constrainedBy: { constraints: [] },
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
      }),
    };

    const fieldSpecs: BlockFieldSpec<FastPwmBlock>[] = [
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
      title: 'Fast PWM',
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
