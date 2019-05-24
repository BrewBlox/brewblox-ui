import { ref } from '@/helpers/component-ref';
import { Arrangement } from '@/store/features';

import BrewPiHardwareTask from './BrewPiHardwareTask.vue';
import BrewPiNamingTask from './BrewPiNamingTask.vue';
import BrewPiSettingsTask from './BrewPiSettingsTask.vue';
import BrewPiWizard from './BrewPiWizard.vue';

ref(BrewPiNamingTask);
ref(BrewPiHardwareTask);
ref(BrewPiSettingsTask);

const arrangement: Arrangement = {
  id: 'BrewPi',
  displayName: 'Classic BrewPi',
  wizard: ref(BrewPiWizard),
};

export default arrangement;
