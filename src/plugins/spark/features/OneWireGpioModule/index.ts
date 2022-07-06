import { Plugin } from 'vue';

import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockSpec,
  BlockType,
  OneWireGpioModuleBlock,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { GpioModuleStatus, GpioPins } from '@/shared-types';
import { WidgetFeature, useFeatureStore } from '@/store/features';

import widget from './OneWireGpioModuleWidget.vue';

const type = BlockType.OneWireGpioModule;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<OneWireGpioModuleBlock> = {
      type,
      generate: () => ({
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
        moduleStatusClear: GpioPins.NONE, // write-only
      }),
    };

    const feature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: type,
      title: 'OneWire GPIO Module',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
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
