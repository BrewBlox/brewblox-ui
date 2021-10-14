import { Plugin } from 'vue';

import { QuickstartFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';

import BrewKettleCompletionTask from './BrewKettleCompletionTask.vue';
import BrewKettleHardwareTask from './BrewKettleHardwareTask.vue';
import BrewKettleIoTask from './BrewKettleIoTask.vue';
import BrewKettleNamingTask from './BrewKettleNamingTask.vue';
import BrewKettleSettingsTask from './BrewKettleSettingsTask.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: QuickstartFeature = {
      id: 'BrewKettle',
      title: 'Brew kettle',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, BrewKettleNamingTask),
        cref(app, BrewKettleHardwareTask),
        cref(app, BrewKettleIoTask),
        cref(app, BrewKettleSettingsTask),
        cref(app, BrewKettleCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
