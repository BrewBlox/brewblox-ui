import { ref } from '@/helpers/component-ref';
import { QuickStart } from '@/store/features';

import GlycolHardwareTask from './GlycolHardwareTask.vue';
import GlycolManualTask from './GlycolManualTask.vue';
import GlycolNamingTask from './GlycolNamingTask.vue';
import GlycolSettingsTask from './GlycolSettingsTask.vue';
import GlycolWizard from './GlycolWizard.vue';

ref(GlycolNamingTask);
ref(GlycolHardwareTask);
ref(GlycolSettingsTask);
ref(GlycolManualTask);

const quickStart: QuickStart = {
  id: 'Glycol',
  displayName: 'Glycol-cooled fermenter',
  wizard: ref(GlycolWizard),
};

export default quickStart;
