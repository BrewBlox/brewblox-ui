import { uid } from 'quasar';

import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import widget from './QuickActionsWidget.vue';
import { QuickActionsConfig } from './types';

const feature: WidgetFeature = {
  id: 'QuickActions',
  title: 'Quick Actions',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 5,
  },
  generateConfig: (): QuickActionsConfig => ({
    steps: [
      {
        id: uid(),
        name: 'Example step - click to edit',
        changes: [],
      },
    ],
    changeIdMigrated: true,
    serviceIdMigrated: true,
  }),
};

export default { feature };
