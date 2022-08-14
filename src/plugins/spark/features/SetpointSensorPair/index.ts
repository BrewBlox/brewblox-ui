import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { deltaTempQty, tempQty } from '@/utils/quantity';
import {
  BlockIntfType,
  BlockType,
  FilterChoice,
  SetpointSensorPairBlock,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './SetpointSensorPairWidget.vue';

const type = BlockType.SetpointSensorPair;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<SetpointSensorPairBlock> = {
      type,
      generate: (): SetpointSensorPairBlock['data'] => ({
        sensorId: bloxLink(null, BlockIntfType.TempSensorInterface),
        storedSetting: tempQty(20),
        setting: tempQty(null),
        value: tempQty(null),
        valueUnfiltered: tempQty(null),
        resetFilter: false,
        enabled: true,
        filter: FilterChoice.FILTER_15s,
        filterThreshold: deltaTempQty(5),
        claimedBy: bloxLink(null),
      }),
    };

    const fieldSpecs: BlockFieldSpec<SetpointSensorPairBlock>[] = [
      {
        type,
        key: 'storedSetting',
        title: 'Setting',
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
        title: 'Linked Sensor',
        component: 'LinkValEdit',
        generate: () => bloxLink(null, BlockIntfType.TempSensorInterface),
      },
      {
        type,
        key: 'setting',
        title: 'Setting (actual)',
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
      title: 'Setpoint',
      role: 'Process',
      component: blockWidgetSelector(app, widget, type),
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
