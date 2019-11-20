import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import { AutomationConfig } from '../types';
import widget from './AutomationWidget.vue';


const feature: Feature = {
  id: 'Automation',
  displayName: 'Automation',
  widgetComponent: ref(widget),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  generateConfig: (): AutomationConfig => ({}),
};

export default { feature };
