import { Plugin } from 'vue';

import { featureStore, QuickstartFeature } from '@/store/features';
import { cref } from '@/utils';

import FermentCompletionTask from './FermentCompletionTask.vue';
import FermentHardwareTask from './FermentHardwareTask.vue';
import FermentNamingTask from './FermentNamingTask.vue';
import FermentSettingsTask from './FermentSettingsTask.vue';

const plugin: Plugin = {
  install(app) {

    const feature: QuickstartFeature = {
      id: 'Ferment',
      title: 'Fermentation fridge',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, FermentNamingTask),
        cref(app, FermentHardwareTask),
        cref(app, FermentSettingsTask),
        cref(app, FermentCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
