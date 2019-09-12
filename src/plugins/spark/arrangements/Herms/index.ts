import { ref } from '@/helpers/component-ref';
import { Arrangement } from '@/store/features';

import HermsHardwareTask from './HermsHardwareTask.vue';
import HermsManualTask from './HermsManualTask.vue';
import HermsMutexTask from './HermsMutexTask.vue';
import HermsNamingTask from './HermsNamingTask.vue';
import HermsPidTask from './HermsPidTask.vue';
import HermsWizard from './HermsWizard.vue';

ref(HermsNamingTask);
ref(HermsHardwareTask);
ref(HermsMutexTask);
ref(HermsManualTask);
ref(HermsPidTask);

const arrangement: Arrangement = {
  id: 'Herms',
  displayName: 'HERMS',
  wizard: ref(HermsWizard),
};

export default arrangement;
