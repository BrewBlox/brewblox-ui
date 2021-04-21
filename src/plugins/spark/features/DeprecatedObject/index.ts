import { Plugin } from 'vue';

import { genericBlockFeature } from '@/plugins/spark/generic';
import { BlockType } from '@/plugins/spark/types';
import { blockWidgetSelector } from '@/plugins/spark/utils';
import { featureStore, WidgetFeature } from '@/store/features';

import widget from './DeprecatedObjectWidget.vue';

const plugin: Plugin = {
  install(app) {

    const feature: WidgetFeature = {
      ...genericBlockFeature,
      id: BlockType.DeprecatedObject,
      title: 'Deprecated Object',
      role: 'Other',
      component: blockWidgetSelector(app, widget, null),
      wizard: false,
      widgetSize: {
        cols: 4,
        rows: 2,
      },
    };

    featureStore.registerWidget(feature);
  },
};

export default plugin;
