import { ref } from '@/helpers/component-ref';
import { QuickStart } from '@/store/features';

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

const quickStart: QuickStart = {
  id: 'Herms',
  displayName: 'HERMS',
  wizard: ref(HermsWizard),
};

export default quickStart;
