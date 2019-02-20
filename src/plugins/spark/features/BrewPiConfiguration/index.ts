import { ref } from '@/helpers/component-ref';
import { Feature } from '@/store/features/state';
import BrewPiCfgWizard from './BrewPiCfgWizard.vue';
import BrewPiCfgNamingTask from './BrewPiCfgNamingTask.vue';
import BrewPiCfgHardwareTask from './BrewPiCfgHardwareTask.vue';
import BrewPiCfgSettingsTask from './BrewPiCfgSettingsTask.vue';

ref(BrewPiCfgNamingTask);
ref(BrewPiCfgHardwareTask);
ref(BrewPiCfgSettingsTask);

const feature: Feature = {
  id: 'BrewPiConfiguration',
  displayName: 'BrewPi-like Setup',
  wizard: ref(BrewPiCfgWizard),
};

export default feature;
