import { Plugin } from 'vue';

import { featureStore, WatcherFeature } from '@/store/features';
import { cref } from '@/utils';

import ConfigWatcher from './ConfigWatcher.vue';

const plugin: Plugin = {
  install(app) {
    const watcher: WatcherFeature = {
      id: 'ConfigWatcher',
      component: cref(app, ConfigWatcher),
      props: {},
    };

    featureStore.addWatcherFeature(watcher);
  },
};

export default plugin;
