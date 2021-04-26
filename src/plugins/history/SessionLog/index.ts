import { Plugin } from 'vue';

import { featureStore, WidgetFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import { historyStore } from '../store';
import widget from './SessionLogWidget.vue';
import { SessionLogConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const feature: WidgetFeature<SessionLogConfig> = {
      id: 'SessionLog',
      title: 'Session Log',
      component: cref(app, widget),
      wizard: true,
      widgetSize: {
        cols: 4,
        rows: 5,
      },
      generateConfig: () => {
        // `historyStore.sessions` must be copied before sorting
        const [last] = [...historyStore.sessions].sort((a, b) => b.date - a.date);
        return { currentSession: last !== undefined ? last.id : null };
      },
    };

    featureStore.registerWidget(feature);
  },
};

export default plugin;
