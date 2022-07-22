import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { useBlockSpecStore } from '@/plugins/spark/store';
import {
  BlockFieldSpec,
  BlockIntfType,
  BlockSpec,
  BlockType,
  DateString,
  SetpointProfileBlock,
} from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils/components';
import { WidgetFeature, useFeatureStore } from '@/store/features';
import { bloxLink } from '@/utils/link';
import { shortDateString } from '@/utils/quantity';

import widget from './SetpointProfileWidget.vue';

const type = BlockType.SetpointProfile;

const plugin: Plugin = {
  install(app) {
    const specStore = useBlockSpecStore();
    const featureStore = useFeatureStore();

    const blockSpec: BlockSpec<SetpointProfileBlock> = {
      type,
      generate: () => ({
        start: new Date().toISOString(),
        points: [],
        enabled: false,
        targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        drivenTargetId: bloxLink(null),
      }),
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
      component: blockWidgetSelector(app, widget, type),
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
