import { ref } from '@/helpers/component-ref';
import { QuickStartFeature } from '@/store/features';

import RimsHardwareTask from './RimsHardwareTask.vue';
import RimsManualTask from './RimsManualTask.vue';
import RimsNamingTask from './RimsNamingTask.vue';
import RimsWizard from './RimsWizard.vue';

ref(RimsHardwareTask);
ref(RimsManualTask);
ref(RimsNamingTask);

const feature: QuickStartFeature = {
  id: 'Rims',
  title: 'RIMS Brew-in-a-Bag',
  component: ref(RimsWizard),
};

export default feature;
