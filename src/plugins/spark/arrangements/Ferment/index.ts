import { ref } from '@/helpers/component-ref';
import { Arrangement } from '@/store/features';

import FermentHardwareTask from './FermentHardwareTask.vue';
import FermentManualTask from './FermentManualTask.vue';
import FermentNamingTask from './FermentNamingTask.vue';
import FermentSettingsTask from './FermentSettingsTask.vue';
import FermentWizard from './FermentWizard.vue';

ref(FermentNamingTask);
ref(FermentHardwareTask);
ref(FermentSettingsTask);
ref(FermentManualTask);

const arrangement: Arrangement = {
  id: 'Ferment',
  displayName: 'Fermentation Fridge',
  wizard: ref(FermentWizard),
};

export default arrangement;
