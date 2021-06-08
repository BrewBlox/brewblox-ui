import { Plugin } from 'vue';

import { historyStore } from '@/plugins/history/store';
import { startup } from '@/startup';
import { autoRegister } from '@/utils';

import Graph from './Graph';
import Metrics from './Metrics';
import SessionLog from './SessionLog';

const plugin: Plugin = {
  install(app) {
    autoRegister(app, require.context('./components', true));

    app.use(Graph);
    app.use(Metrics);
    app.use(SessionLog);

    startup.onStart(() => historyStore.start());
  },
};

export default plugin;
