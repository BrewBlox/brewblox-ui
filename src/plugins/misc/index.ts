import { Plugin } from 'vue';

import ConfigWatcher from './ConfigWatcher';
import Countdown from './Countdown';
import Stopwatch from './Stopwatch';
import Webframe from './Webframe';

const plugin: Plugin = {
  install(app) {
    app.use(ConfigWatcher);
    app.use(Countdown);
    app.use(Stopwatch);
    app.use(Webframe);
  },
};

export default plugin;
