import { BlockType, TempSensorExternalBlock } from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxQty, durationString, tempQty } from '@/utils/quantity';
import widget from './TempSensorExternalWidget.vue';

const type = BlockType.TempSensorExternal;
const title = 'Temp Sensor (External)';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<TempSensorExternalBlock> = {
      type,
      title,
      generate: (): TempSensorExternalBlock['data'] => ({
        enabled: true,
        timeout: bloxQty('5m'),
        setting: tempQty(20),
        lastUpdated: null,
        value: tempQty(null),
      }),
      analyze: (block: TempSensorExternalBlock) => {
        const { enabled, value } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (value.value == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<TempSensorExternalBlock>[] = [
      {
        type,
        key: 'enabled',
        title: 'Enabled',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'timeout',
        title: 'Timeout',
        component: 'DurationValEdit',
        generate: () => bloxQty('5m'),
        pretty: durationString,
      },
      {
        type,
        key: 'setting',
        title: 'Sensor Setting',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Sensor value',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title,
      role: 'Process',
      component: cref(app, widget),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
