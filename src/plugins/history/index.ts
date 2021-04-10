import { Plugin } from 'vue';

import { startup } from '@/plugins/startup';
import { autoRegister } from '@/utils/component-ref';

import Graph from './Graph';
import Metrics from './Metrics';
import { historyStore } from './store';

const plugin: Plugin = {
  install(app) {
    autoRegister(app, require.context('./components', true));

    app.use(Graph);
    app.use(Metrics);

    startup.onStart(() => historyStore.start());
  },
};

export default plugin;
