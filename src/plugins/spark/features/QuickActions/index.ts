import { ref, selector } from '@/helpers/component-ref';
import { WidgetFeature } from '@/store/features';

import ChangeConfirmDialog from './ChangeConfirmDialog.vue';
import widget from './QuickActionsWidget.vue';
import wizard from './QuickActionsWizard.vue';

ref(ChangeConfirmDialog);

const feature: WidgetFeature = {
  id: 'QuickActions',
  title: 'Quick Actions',
  widgetComponent: selector(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 2,
  },
};

export default { feature };
