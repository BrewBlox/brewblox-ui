import { nanoid } from 'nanoid';
import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import widget from './QuickActionsWidget.vue';
import { QuickActionsConfig } from './types';


const plugin: Plugin = {
  install(app) {

    const feature: WidgetFeature<QuickActionsConfig> = {
      id: 'QuickActions',
      title: 'Quick Actions',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 5,
      },
      generateConfig: () => ({
        actions: [
          {
            id: nanoid(),
            name: 'Example action - click to edit',
            changes: [],
          },
        ],
        changeIdMigrated: true,
        serviceIdMigrated: true,
      }),
    };

    featureStore.registerWidget(feature);
  },
};

export default plugin;
