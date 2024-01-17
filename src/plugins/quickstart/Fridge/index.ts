import { Plugin } from 'vue';
import { QuickstartFeature, useFeatureStore } from '@/store/features';
import { cref } from '@/utils/component-ref';
import FridgeCompletionTask from './FridgeCompletionTask.vue';
import FridgeHardwareTask from './FridgeHardwareTask.vue';
import FridgeIoTask from './FridgeIoTask.vue';
import FridgeNamingTask from './FridgeNamingTask.vue';
import FridgeSettingsTask from './FridgeSettingsTask.vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();
    const feature: QuickstartFeature = {
      id: 'Fridge',
      title: 'Fridge without beer sensor',
      tasks: [
        'QuickstartServiceTask',
        'QuickstartDiscoveryTask',
        cref(app, FridgeNamingTask),
        cref(app, FridgeHardwareTask),
        cref(app, FridgeIoTask),
        cref(app, FridgeSettingsTask),
        cref(app, FridgeCompletionTask),
      ],
    };

    featureStore.addQuickstartFeature(feature);
  },
};

export default plugin;
