import { Plugin } from 'vue';

import { QuickstartFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';

import FermentCompletionTask from './FermentCompletionTask.vue';
import FermentHardwareTask from './FermentHardwareTask.vue';
import FermentIoTask from './FermentIoTask.vue';
import FermentNamingTask from './FermentNamingTask.vue';
import FermentSettingsTask from './FermentSettingsTask.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: QuickstartFeature = {
      id: 'Ferment',
      title: 'Fermentation fridge',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, FermentNamingTask),
        cref(app, FermentHardwareTask),
        cref(app, FermentIoTask),
        cref(app, FermentSettingsTask),
        cref(app, FermentCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
