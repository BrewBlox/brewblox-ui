import { Plugin } from 'vue';

import { QuickstartFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';

import RimsCompletionTask from './RimsCompletionTask.vue';
import RimsHardwareTask from './RimsHardwareTask.vue';
import RimsIoTask from './RimsIoTask.vue';
import RimsNamingTask from './RimsNamingTask.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: QuickstartFeature = {
      id: 'Rims',
      title: 'RIMS Brew-in-a-Bag',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, RimsNamingTask),
        cref(app, RimsHardwareTask),
        cref(app, RimsIoTask),
        cref(app, RimsCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
