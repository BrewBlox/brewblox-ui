import { ref } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import ChangeConfirmDialog from './ChangeConfirmDialog.vue';
import widget from './QuickActionsWidget.vue';
import { QuickActionsConfig } from './types';

ref(ChangeConfirmDialog);

const feature: WidgetFeature = {
  id: 'QuickActions',
  title: 'Quick Actions',
  component: ref(widget),
  wizard: true,
  widgetSize: {
    cols: 4,
    rows: 2,
  },
  generateConfig: (): QuickActionsConfig => ({
    steps: [],
    changeIdMigrated: true,
    serviceIdMigrated: true,
  }),
};

export default { feature };
