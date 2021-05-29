import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockFieldSpec, BlockIntfType, BlockSpec, BlockType, SetpointProfileBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/bloxfield';
import { shortDateString } from '@/utils/functional';

import widget from './SetpointProfileWidget.vue';

const type = BlockType.SetpointProfile;

const plugin: Plugin = {
  install(app) {

    const blockSpec: BlockSpec<SetpointProfileBlock> = {
      type,
      generate: () => ({
        start: new Date().getTime() / 1000,
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
        componentProps: { timeScale: 1000 },
        generate: () => new Date().getTime() / 1000,
        valueHint: 'seconds since 1/1/1970',
        pretty: (val: number): string => {
          if (val === 0) { return 'now'; }
          if (!val) { return 'invalid date'; }
          return shortDateString(val * 1000);
        },
      },
      {
        type,
        key: 'targetId',
        title: 'Target',
        component: 'LinkValEdit',
        generate: () => bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
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

    sparkStore.addBlockSpec(blockSpec);
    sparkStore.addFieldSpecs(fieldSpecs);
    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
