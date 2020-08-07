import { ref } from '@/helpers/component-ref';
import { QuickStartFeature } from '@/store/features';

import FermentHardwareTask from './FermentHardwareTask.vue';
import FermentManualTask from './FermentManualTask.vue';
import FermentNamingTask from './FermentNamingTask.vue';
import FermentSettingsTask from './FermentSettingsTask.vue';
import FermentWizard from './FermentWizard.vue';

ref(FermentNamingTask);
ref(FermentHardwareTask);
ref(FermentSettingsTask);
ref(FermentManualTask);

const feature: QuickStartFeature = {
  id: 'Ferment',
  title: 'Fermentation fridge',
  component: ref(FermentWizard),
};

export default feature;
