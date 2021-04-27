import { Plugin } from 'vue';

import { featureStore, QuickstartFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import HermsCompletionTask from './HermsCompletionTask.vue';
import HermsHardwareTask from './HermsHardwareTask.vue';
import HermsMutexTask from './HermsMutexTask.vue';
import HermsNamingTask from './HermsNamingTask.vue';
import HermsSettingsTask from './HermsSettingsTask.vue';

const plugin: Plugin = {
  install(app) {

    const feature: QuickstartFeature = {
      id: 'Herms',
      title: 'HERMS',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, HermsNamingTask),
        cref(app, HermsHardwareTask),
        cref(app, HermsMutexTask),
        cref(app, HermsSettingsTask),
        cref(app, HermsCompletionTask),
      ],
    };

    featureStore.registerQuickstart(feature);
  },
};

export default plugin;
