import widget from './DigitalInputWidget.vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { enumHint } from '@/plugins/spark/utils/formatting';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { bloxQty } from '@/utils/quantity';
import {
  BlockIntfType,
  BlockType,
  DigitalInputBlock,
  DigitalState,
  ToggleBehavior,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';

const type = BlockType.DigitalInput;
const title = 'Digital Input';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<DigitalInputBlock> = {
      type,
      title,
      generate: (): DigitalInputBlock['data'] => ({
        hwDevice: bloxLink(null, BlockIntfType.IoArrayInterface),
        channel: 0,
        state: DigitalState.STATE_INACTIVE,
        invert: false,
        behavior: ToggleBehavior.DIRECT,
        minActiveTime: bloxQty('0s'),
        hwState: null,
      }),
      analyze: (block: DigitalInputBlock) => {
        const { hwDevice, channel } = block.data;
        if (hwDevice.id == null || channel == 0) {
          return 'Invalid';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<DigitalInputBlock>[] = [
      {
        type,
        key: 'invert',
        title: 'Invert',
        component: 'BoolValEdit',
        generate: () => false,
      },
      {
        type,
        key: 'behavior',
        title: 'Behavior',
        component: 'EnumValEdit',
        componentProps: { options: ToggleBehavior },
        generate: (): ToggleBehavior => ToggleBehavior.DIRECT,
        valueHint: enumHint(ToggleBehavior),
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
      title,
      role: 'Output',
      component: cref(app, widget),
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
