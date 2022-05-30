import { Plugin } from 'vue';

import { WidgetFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';

import { useHistoryStore } from '../store';
import widget from './SessionLogWidget.vue';
import { SessionLogConfig } from './types';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const historyStore = useHistoryStore();

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
        const [last] = [...historyStore.sessions].sort(
          (a, b) => b.date - a.date,
        );
        return { currentSession: last !== undefined ? last.id : null };
      },
    };

    featureStore.addWidgetFeature(feature);
  },
};

export default plugin;
