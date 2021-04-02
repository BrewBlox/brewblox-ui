import { ref } from '@/helpers/component-ref';
import { WatcherFeature } from '@/store/features';

import ConfigWatcher from './ConfigWatcher.vue';

const watcher: WatcherFeature = {
  id: 'ConfigWatcher',
  component: ref(ConfigWatcher),
  props: {},
};

export default watcher;
