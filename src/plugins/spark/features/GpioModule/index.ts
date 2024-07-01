import {
  BlockType,
  GpioErrorFlags,
  GpioModuleBlock,
  GpioPins,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import widget from './GpioModuleWidget.vue';

const type = BlockType.GpioModule;
const title = 'GPIO Module';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<GpioModuleBlock> = {
      type,
      title,
      hasRelations: true,
      generate: (): GpioModuleBlock['data'] => ({
        channels: [],
        modulePosition: 0,
        useExternalPower: false,
        status: {
          moduleStatus: GpioErrorFlags.NONE,
          pullUpDesired: GpioPins.NONE,
          pullUpStatus: GpioPins.NONE,
          pullUpWhenActive: GpioPins.NONE,
          pullUpWhenInactive: GpioPins.NONE,
          pullDownDesired: GpioPins.NONE,
          pullDownStatus: GpioPins.NONE,
          pullDownWhenActive: GpioPins.NONE,
          pullDownWhenInactive: GpioPins.NONE,
          overCurrent: GpioPins.NONE,
          openLoad: GpioPins.NONE,
          faultsHistory5m: GpioErrorFlags.NONE,
          faultsHistory60m: GpioErrorFlags.NONE,
        },
        analogChannels: [],
      }),
      analyze: (block: GpioModuleBlock) => {
        const { moduleStatus } = block.data.status;
        switch (moduleStatus) {
          case GpioErrorFlags.NONE:
          case GpioErrorFlags.OPEN_LOAD:
            return 'Active';
          default:
            return 'Invalid';
        }
      },
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: type,
      title,
      role: 'Output',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
