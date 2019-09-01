import { ref } from '@/helpers/component-ref';
import { Arrangement } from '@/store/features';

import HermsHardwareTask from './HermsHardwareTask.vue';
import HermsManualTask from './HermsManualTask.vue';
import HermsNamingTask from './HermsNamingTask.vue';
import HermsSettingsTask from './HermsSettingsTask.vue';
import HermsWizard from './HermsWizard.vue';

ref(HermsNamingTask);
ref(HermsHardwareTask);
ref(HermsSettingsTask);
ref(HermsManualTask);

const arrangement: Arrangement = {
  id: 'Herms',
  displayName: 'HERMS',
  wizard: ref(HermsWizard),
};

export default arrangement;
