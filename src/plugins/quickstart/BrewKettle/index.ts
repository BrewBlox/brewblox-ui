import { ref } from '@/helpers/component-ref';
import { QuickStartFeature } from '@/store/features';

import BrewKettleHardwareTask from './BrewKettleHardwareTask.vue';
import BrewKettleManualTask from './BrewKettleManualTask.vue';
import BrewKettleNamingTask from './BrewKettleNamingTask.vue';
import BrewKettleSettingsTask from './BrewKettleSettingsTask.vue';
import BrewKettleWizard from './BrewKettleWizard.vue';

ref(BrewKettleNamingTask);
ref(BrewKettleHardwareTask);
ref(BrewKettleManualTask);
ref(BrewKettleSettingsTask);

const feature: QuickStartFeature = {
  id: 'BrewKettle',
  title: 'Brew Kettle',
  component: ref(BrewKettleWizard),
};

export default feature;
