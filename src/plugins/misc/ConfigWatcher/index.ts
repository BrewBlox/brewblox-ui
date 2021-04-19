import { Plugin } from 'vue';

import { featureStore, WatcherFeature } from '@/store/features';
import { cref } from '@/utils/component-ref';

import ConfigWatcher from './ConfigWatcher.vue';

const plugin: Plugin = {
  install(app) {
    const watcher: WatcherFeature = {
      id: 'ConfigWatcher',
      component: cref(app, ConfigWatcher),
      props: {},
    };

    featureStore.registerWatcher(watcher);
  },
};

export default plugin;
