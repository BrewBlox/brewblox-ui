import { ref, selector } from '@/helpers/component-ref';
import { Feature } from '@/store/features';

import widget from './SessionNotesWidget.vue';
import wizard from './SessionNotesWizard.vue';

const feature: Feature = {
  id: 'SessionNotes',
  displayName: 'Session Notes',
  widgetComponent: selector(widget),
  wizardComponent: ref(wizard),
  widgetSize: {
    cols: 4,
    rows: 5,
  },
};

export default feature;
