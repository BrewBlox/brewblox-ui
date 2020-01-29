import { selector } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { historyStore } from '../store';
import widget from './SessionLogWidget.vue';
import { SessionLogConfig } from './types';

const feature: WidgetFeature = {
  id: 'SessionLog',
  title: 'Session Log',
  widgetComponent: selector(widget),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: (): SessionLogConfig => {
    const [last] = [...historyStore.sessionValues].sort((a, b) => b.date - a.date);
    return { currentSession: last !== undefined ? last.id : null };
  },
};

export default feature;
