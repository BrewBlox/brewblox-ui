import { ref } from '@/helpers/component-ref';
import { QuickStartFeature } from '@/store/features';

import HermsHardwareTask from './HermsHardwareTask.vue';
import HermsManualTask from './HermsManualTask.vue';
import HermsMutexTask from './HermsMutexTask.vue';
import HermsNamingTask from './HermsNamingTask.vue';
import HermsSettingsTask from './HermsSettingsTask.vue';
import HermsWizard from './HermsWizard.vue';

ref(HermsNamingTask);
ref(HermsHardwareTask);
ref(HermsMutexTask);
ref(HermsManualTask);
ref(HermsSettingsTask);

const feature: QuickStartFeature = {
  id: 'Herms',
  title: 'HERMS',
  wizardComponent: ref(HermsWizard),
};

export default feature;
