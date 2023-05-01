import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockSpec } from '@/plugins/spark/types';
import { useFeatureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { bloxLink } from '@/utils/link';
import { shortDateString, tempQty } from '@/utils/quantity';
import {
  BlockIntfType,
  BlockType,
  DateString,
  SetpointProfileBlock,
} from 'brewblox-proto/ts';
import { Plugin } from 'vue';
import widget from './SetpointProfileWidget.vue';

const type = BlockType.SetpointProfile;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<SetpointProfileBlock> = {
      type,
      generate: (): SetpointProfileBlock['data'] => ({
        start: new Date().toISOString(),
        points: [],
        enabled: false,
        targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        setting: tempQty(null),
      }),
      analyze: (block: SetpointProfileBlock) => {
        const { enabled, targetId } = block.data;
        if (!enabled) {
          return 'Disabled';
        }
        if (targetId.id == null) {
          return 'Invalid';
        }
        return 'Active';
      },
    };

    const fieldSpecs: BlockFieldSpec<SetpointProfileBlock>[] = [
      {
        type,
        key: 'enabled',
        title: 'Enabled',
        component: 'BoolValEdit',
        generate: () => true,
      },
      {
        type,
        key: 'start',
        title: 'Start Time',
        component: 'DateValEdit',
        generate: () => new Date().toISOString(),
        pretty: (val: DateString): string =>
          val == null ? 'now' : shortDateString(val),
      },
      {
        type,
        key: 'targetId',
        title: 'Target',
        component: 'LinkValEdit',
        generate: () =>
          bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
      },
    ];

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: type,
      title: 'Setpoint Profile',
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
