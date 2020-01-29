import { ref } from '@/helpers/component-ref';
import { QuickStartFeature } from '@/store/features';

import GlycolHardwareTask from './GlycolHardwareTask.vue';
import GlycolManualTask from './GlycolManualTask.vue';
import GlycolNamingTask from './GlycolNamingTask.vue';
import GlycolSettingsTask from './GlycolSettingsTask.vue';
import GlycolWizard from './GlycolWizard.vue';

ref(GlycolNamingTask);
ref(GlycolHardwareTask);
ref(GlycolSettingsTask);
ref(GlycolManualTask);

const feature: QuickStartFeature = {
  id: 'Glycol',
  title: 'Glycol-cooled fermenter',
  wizardComponent: ref(GlycolWizard),
};

export default feature;
