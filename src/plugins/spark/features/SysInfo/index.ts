import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockSpec, BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { SparkPlatform, SysInfoBlock } from '@/shared-types';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './SysInfoWidget.vue';

const typeName = BlockType.SysInfo;


const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<SysInfoBlock> = {
      id: typeName,
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
      fields: [],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Device Info',
      role: 'Display',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
      // System objects can't be created or deleted
      wizard: false,
      removeActions: undefined,
    };

    sparkStore.addBlockSpec(spec);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
