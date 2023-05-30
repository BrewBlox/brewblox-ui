import { systemBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxQty } from '@/utils/quantity';
import {
  BlockType,
  DisplayTempUnit,
  SparkPlatform,
  SysInfoBlock,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './SysInfoWidget.vue';

const type = BlockType.SysInfo;
const title = 'Spark System Info';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const specStore = useBlockSpecStore();

    const blockSpec: BlockSpec<SysInfoBlock> = {
      type,
      title,
      generate: (): SysInfoBlock['data'] => ({
        deviceId: '',
        platform: SparkPlatform.PLATFORM_UNKNOWN,
        version: '',
        releaseDate: '',
        protocolVersion: '',
        protocolDate: '',
        ip: '0.0.0.0',
        uptime: bloxQty('0s'),
        updatesPerSecond: 0,
        systemTime: '',
        timeZone: 'etc/UTC',
        tempUnit: DisplayTempUnit.TEMP_CELSIUS,
        displayBrightness: 255,
        voltage5: 5,
        voltageExternal: 12,
        memoryFree: 0,
        memoryFreeContiguous: 0,
        memoryFreeLowest: 0,
      }),
      analyze: () => 'Active',
    };

    const feature: WidgetFeature = {
      ...systemBlockFeature,
      id: type,
      title,
      role: 'Display',
      component: cref(app, widget),
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
