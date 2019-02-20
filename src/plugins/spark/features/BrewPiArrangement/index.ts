import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import BrewPiWizard from './BrewPiWizard.vue';
import BrewPiNamingTask from './BrewPiNamingTask.vue';
import BrewPiHardwareTask from './BrewPiHardwareTask.vue';
import BrewPiSettingsTask from './BrewPiSettingsTask.vue';

ref(BrewPiNamingTask);
ref(BrewPiHardwareTask);
ref(BrewPiSettingsTask);

const feature: Feature = {
  id: 'BrewPiArrangement',
  displayName: 'BrewPi-like Arrangement',
  wizard: ref(BrewPiWizard),
};

export default feature;
