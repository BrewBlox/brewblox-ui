import { Plugin } from 'vue';

import { featureStore, QuickstartFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import BrewKettleCompletionTask from './BrewKettleCompletionTask.vue';
import BrewKettleHardwareTask from './BrewKettleHardwareTask.vue';
import BrewKettleNamingTask from './BrewKettleNamingTask.vue';
import BrewKettleSettingsTask from './BrewKettleSettingsTask.vue';


const plugin: Plugin = {
  install(app) {

    const feature: QuickstartFeature = {
      id: 'BrewKettle',
      title: 'Brew kettle',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, BrewKettleNamingTask),
        cref(app, BrewKettleHardwareTask),
        cref(app, BrewKettleSettingsTask),
        cref(app, BrewKettleCompletionTask),
      ],
    };

    featureStore.registerQuickstart(feature);
  },
};

export default plugin;
