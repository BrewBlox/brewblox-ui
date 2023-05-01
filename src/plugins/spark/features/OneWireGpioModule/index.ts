import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import {
  BlockType,
  GpioModuleStatus,
  GpioPins,
  OneWireGpioModuleBlock,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './OneWireGpioModuleWidget.vue';

const type = BlockType.OneWireGpioModule;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<OneWireGpioModuleBlock> = {
      type,
      generate: (): OneWireGpioModuleBlock['data'] => ({
        channels: [],
        modulePosition: 0,
        useExternalPower: false,
        moduleStatus: GpioModuleStatus.NONE,
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
        clearFaults: false, // write-only
      }),
      analyze: (block: OneWireGpioModuleBlock) => {
        const { moduleStatus } = block.data;
        if (moduleStatus != GpioModuleStatus.NONE) {
          return 'Invalid';
        }
        return 'Active';
      },
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: type,
      title: 'OneWire GPIO Module',
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
