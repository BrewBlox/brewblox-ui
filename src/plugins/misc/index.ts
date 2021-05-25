import { Plugin } from 'vue';

import ConfigWatcher from './ConfigWatcher';
import Stopwatch from './Stopwatch';
import Webframe from './Webframe';

const plugin: Plugin = {
  install(app) {
    app.use(ConfigWatcher);
    app.use(Stopwatch);
    app.use(Webframe);
  },
};

export default plugin;
