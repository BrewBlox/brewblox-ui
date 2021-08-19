import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType, OneWireGpioModuleBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { GpioModuleStatus, GpioPins } from '@/shared-types';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './OneWireGpioModuleWidget.vue';

const type = BlockType.OneWireGpioModule;

const plugin: Plugin = {
  install(app) {

    const blockSpec: BlockSpec<OneWireGpioModuleBlock> = {
      type,
      generate: () => ({
        channels: [],
        modulePosition: 0,
        moduleStatus: GpioModuleStatus.NONE,
        pullUp: GpioPins.NONE,
        pullUpWhenActive: GpioPins.NONE,
        pullUpWhenInactive: GpioPins.NONE,
        pullDown: GpioPins.NONE,
        pullDownWhenActive: GpioPins.NONE,
        pullDownWhenInactive: GpioPins.NONE,
        pullUpOverCurrent: GpioPins.NONE,
        pullDownOverCurrent: GpioPins.NONE,
        pullUpOpenLoad: GpioPins.NONE,
        pullDownOpenLoad: GpioPins.NONE,
        moduleStatusClear: GpioPins.NONE, // write-only
      }),
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title: 'OneWire GPIO Module',
      role: 'Output',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 4,
      },
    };

    sparkStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
