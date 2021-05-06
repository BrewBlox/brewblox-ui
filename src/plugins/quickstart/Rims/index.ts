import { Plugin } from 'vue';

import { featureStore, QuickstartFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import RimsCompletionTask from './RimsCompletionTask.vue';
import RimsHardwareTask from './RimsHardwareTask.vue';
import RimsNamingTask from './RimsNamingTask.vue';

const plugin: Plugin = {
  install(app) {

    const feature: QuickstartFeature = {
      id: 'Rims',
      title: 'RIMS Brew-in-a-Bag',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, RimsNamingTask),
        cref(app, RimsHardwareTask),
        cref(app, RimsCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
