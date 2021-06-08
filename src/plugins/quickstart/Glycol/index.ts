import { Plugin } from 'vue';

import { featureStore, QuickstartFeature } from '@/store/features';
import { cref } from '@/utils';

import GlycolCompletionTask from './GlycolCompletionTask.vue';
import GlycolHardwareTask from './GlycolHardwareTask.vue';
import GlycolNamingTask from './GlycolNamingTask.vue';
import GlycolSettingsTask from './GlycolSettingsTask.vue';

const plugin: Plugin = {
  install(app) {

    const feature: QuickstartFeature = {
      id: 'Glycol',
      title: 'Glycol-cooled fermenter',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, GlycolNamingTask),
        cref(app, GlycolHardwareTask),
        cref(app, GlycolSettingsTask),
        cref(app, GlycolCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
