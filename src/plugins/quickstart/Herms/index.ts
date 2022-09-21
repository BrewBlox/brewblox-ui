import { QuickstartFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';
import HermsCompletionTask from './HermsCompletionTask.vue';
import HermsHardwareTask from './HermsHardwareTask.vue';
import HermsIoTask from './HermsIoTask.vue';
import HermsMutexTask from './HermsMutexTask.vue';
import HermsNamingTask from './HermsNamingTask.vue';
import HermsSettingsTask from './HermsSettingsTask.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const feature: QuickstartFeature = {
      id: 'Herms',
      title: 'HERMS',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, HermsNamingTask),
        cref(app, HermsHardwareTask),
        cref(app, HermsIoTask),
        cref(app, HermsMutexTask),
        cref(app, HermsSettingsTask),
        cref(app, HermsCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
