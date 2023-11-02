import ConfigWatcher from './ConfigWatcher.vue';
import { useFeatureStore, WatcherFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';
import { Plugin } from 'vue';

const plugin: Plugin = {
  install(app) {
    const featureStore = useFeatureStore();

    const watcher: WatcherFeature = {
      id: 'ConfigWatcher',
      component: cref(app, ConfigWatcher),
      props: {},
    };

    featureStore.addWatcherFeature(watcher);
  },
};

export default plugin;
