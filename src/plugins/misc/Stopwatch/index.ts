import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './StopwatchWidget.vue';
import { StopwatchConfig } from './types';

const feature: WidgetFeature<StopwatchConfig> = {
  id: 'Stopwatch',
  title: 'Stopwatch',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  generateConfig: () => ({
    session: null,
  }),
};

export default feature;
