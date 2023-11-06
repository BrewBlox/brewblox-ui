import widget from './SetpointSensorPairWidget.vue';
import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { deltaTempQty, tempQty } from '@/utils/quantity';
import {
  BlockIntfType,
  BlockType,
  FilterChoice,
  SetpointSensorPairBlock,
  SettingMode,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';

const type = BlockType.SetpointSensorPair;
const title = 'Setpoint';

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<SetpointSensorPairBlock> = {
      type,
      title,
      generate: (): SetpointSensorPairBlock['data'] => ({
        sensorId: bloxLink(null, BlockIntfType.TempSensorInterface),
        storedSetting: tempQty(20),
        desiredSetting: tempQty(null),
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        resetFilter: false,
        enabled: true,
        filter: FilterChoice.FILTER_15s,
        filterThreshold: deltaTempQty(5),
        claimedBy: bloxLink(null),
        settingMode: SettingMode.STORED,
      }),
      analyze: (block: SetpointSensorPairBlock) => {
        const { enabled, sensorId, setting, value } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (sensorId.id == null) {
          return 'Invalid';
        }
        if (setting.value == null || value.value == null) {
          return 'Inactive';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<SetpointSensorPairBlock>[] = [
      {
        type,
        key: 'storedSetting',
        title: 'Stored setting',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
      },
      {
        type,
        key: 'enabled',
        title: 'Enabled',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'filterThreshold',
        title: 'Fast step threshold',
        component: 'QuantityValEdit',
        generate: () => deltaTempQty(5),
      },
      {
        type,
        key: 'sensorId',
        title: 'Linked sensor',
        component: 'LinkValEdit',
        generate: () => bloxLink(null, BlockIntfType.TempSensorInterface),
      },
      {
        type,
        key: 'desiredSetting',
        title: 'Desired setting',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'setting',
        title: 'Actual setting',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'value',
        title: 'Sensor',
        component: 'QuantityValEdit',
        generate: () => tempQty(20),
        readonly: true,
        graphed: true,
      },
      {
        type,
        key: 'valueUnfiltered',
        title: 'Sensor unfiltered',
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
        rows: 2,
      },
    };

    specStore.addBlockSpec(blockSpec);
    specStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
