import { Plugin } from 'vue';

import { systemBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { SparkPlatform, SysInfoBlock } from '@/shared-types';
import { useFeatureStore, WidgetFeature } from '@/store/features';

import widget from './SysInfoWidget.vue';

const type = BlockType.SysInfo;

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<SysInfoBlock> = {
      type,
      generate: () => ({
        deviceId: '',
        platform: SparkPlatform.PLATFORM_UNKNOWN,
        version: '',
        releaseDate: '',
        protocolVersion: '',
        protocolDate: '',
        command: null,
        trace: [],
      }),
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title: 'Spark System Info',
      role: 'Display',
      component: blockWidgetSelector(app, widget, type),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
