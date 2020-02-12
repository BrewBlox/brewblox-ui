import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import { AutomationConfig } from '../types';
import widget from './AutomationWidget.vue';


const feature: WidgetFeature = {
  id: 'Automation',
  title: 'Automation',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  generateConfig: (): AutomationConfig => ({}),
};

export default { feature };
