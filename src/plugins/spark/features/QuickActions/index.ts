import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import ChangeConfirmDialog from './ChangeConfirmDialog.vue';
import widget from './QuickActionsWidget.vue';
import wizard from './QuickActionsWizard.vue';

ref(ChangeConfirmDialog);

const feature: Feature = {
  id: 'QuickActions',
  displayName: 'Quick Actions',
  widgetComponent: ref(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
