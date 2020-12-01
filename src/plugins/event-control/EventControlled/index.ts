import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './EventControlledWidget.vue';
import { EventControlledConfig } from './types';

const feature: WidgetFeature<EventControlledConfig> = {
  id: 'EventControlled',
  title: 'Event Driven Device',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 4,
  },
  generateConfig: () => ({
    deviceId: '',
  }),
};

export default feature;
