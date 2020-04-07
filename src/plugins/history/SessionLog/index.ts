import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { historyStore } from '../store';
import widget from './SessionLogWidget.vue';
import { SessionLogConfig } from './types';

const feature: WidgetFeature<SessionLogConfig> = {
  id: 'SessionLog',
  title: 'Session Log',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: () => {
    const [last] = [...historyStore.sessions].sort((a, b) => b.date - a.date);
    return { currentSession: last !== undefined ? last.id : null };
  },
};

export default feature;
