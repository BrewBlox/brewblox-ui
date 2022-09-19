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
  BlockIntfType,
  BlockType,
  DigitalActuatorBlock,
  DigitalConstraintsObj,
  DigitalState,
  SettingMode,
  TransitionDurationPreset,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './DigitalActuatorWidget.vue';

const type = BlockType.DigitalActuator;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DigitalActuatorBlock> = {
      type,
      generate: (): DigitalActuatorBlock['data'] => ({
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
        channel: 0,
        storedState: DigitalState.STATE_INACTIVE,
        desiredState: DigitalState.STATE_INACTIVE,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        constrainedBy: { constraints: [] },
        transitionDurationPreset: TransitionDurationPreset.ST_OFF,
        transitionDurationSetting: bloxQty('0s'),
        transitionDurationValue: bloxQty('0s'),
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
    };

    const fieldSpecs: BlockFieldSpec<DigitalActuatorBlock>[] = [
      {
        type,
        key: 'storedState',
        title: 'Stored state',
        component: 'StateValEdit',
        generate: () => DigitalState.STATE_INACTIVE,
        valueHint: enumHint(DigitalState),
      },
      {
        type,
        key: 'invert',
        title: 'Invert',
        component: 'BoolValEdit',
        generate: () => false,
      },
      {
        type,
        key: 'constrainedBy',
        title: 'Constraints',
        component: 'DigitalConstraintsValEdit',
        generate: (): DigitalConstraintsObj => ({ constraints: [] }),
        pretty: prettifyConstraints,
      },
      {
        type,
        key: 'desiredState',
        title: 'Desired state',
        component: 'StateValEdit',
        generate: () => DigitalState.STATE_INACTIVE,
        valueHint: enumHint(DigitalState),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'state',
        title: 'Actual state',
        component: 'StateValEdit',
        generate: (): DigitalState => DigitalState.STATE_INACTIVE,
        valueHint: enumHint(DigitalState),
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Digital Actuator',
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
