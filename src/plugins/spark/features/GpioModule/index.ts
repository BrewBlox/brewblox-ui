import {
  BlockType,
  GpioErrorFlags,
  GpioModuleBlock,
  GpioPins,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { discoveredBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockConfig, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { Widget } from '@/store/widgets';
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

    const renamedFeature: WidgetFeature = {
      ...discoveredBlockFeature,
      id: 'OneWireGpioModule',
      title: 'OneWire GPIO Module (renamed)',
      role: 'Output',
      component: '',
      widgetSize: { cols: 0, rows: 0 },
      upgrade: (widget: Widget<unknown>): Widget<BlockConfig> | null => {
        return { ...widget, feature: type } as Widget<BlockConfig>;
      },
      experimental: true,
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
    featureStore.addWidgetFeature(renamedFeature);
  },
};

export default plugin;
