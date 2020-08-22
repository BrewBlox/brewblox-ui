import { ref } from '@/helpers/component-ref';
import { QuickStartFeature } from '@/store/features';

import FridgeHardwareTask from './FridgeHardwareTask.vue';
import FridgeManualTask from './FridgeManualTask.vue';
import FridgeNamingTask from './FridgeNamingTask.vue';
import FridgeSettingsTask from './FridgeSettingsTask.vue';
import FridgeWizard from './FridgeWizard.vue';

ref(FridgeNamingTask);
ref(FridgeHardwareTask);
ref(FridgeSettingsTask);
ref(FridgeManualTask);

const feature: QuickStartFeature = {
  id: 'Fridge',
  title: 'Non-fermentation fridge',
  component: ref(FridgeWizard),
};

export default feature;
