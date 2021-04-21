import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { sparkStore } from '@/plugins/spark/store';
import { BlockIntfType, BlockSpec, BlockType, SetpointProfileBlock } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';
import { bloxLink } from '@/utils/bloxfield';
import { shortDateString } from '@/utils/functional';

import widget from './SetpointProfileWidget.vue';

const typeName = BlockType.SetpointProfile;

const plugin: Plugin = {
  install(app) {

    const spec: BlockSpec<SetpointProfileBlock> = {
      id: typeName,
      generate: () => ({
        start: new Date().getTime() / 1000,
        points: [],
        enabled: false,
        targetId: bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        drivenTargetId: bloxLink(null),
      }),
      fields: [
        {
          key: 'enabled',
          title: 'Enabled',
          component: 'BoolValEdit',
          generate: () => true,
        },
        {
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
          key: 'targetId',
          title: 'Target',
          component: 'LinkValEdit',
          generate: () => bloxLink(null, BlockIntfType.SetpointSensorPairInterface),
        },
      ],
    };

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: typeName,
      title: 'Setpoint Profile',
      role: 'Process',
      component: blockWidgetSelector(app, widget, typeName),
      widgetSize: {
        cols: 4,
        rows: 3,
      },
    };

    sparkStore.registerSpec(spec);
    featureStore.registerWidget(feature);
  },
};

export default plugin;
