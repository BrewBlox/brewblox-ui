import { QuickstartFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';
import GlycolCompletionTask from './GlycolCompletionTask.vue';
import GlycolHardwareTask from './GlycolHardwareTask.vue';
import GlycolIoTask from './GlycolIoTask.vue';
import GlycolNamingTask from './GlycolNamingTask.vue';
import GlycolSettingsTask from './GlycolSettingsTask.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: QuickstartFeature = {
      id: 'Glycol',
      title: 'Glycol-cooled fermenter',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, GlycolNamingTask),
        cref(app, GlycolHardwareTask),
        cref(app, GlycolIoTask),
        cref(app, GlycolSettingsTask),
        cref(app, GlycolCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
