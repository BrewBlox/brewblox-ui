import Graph from './Graph';
import Metrics from './Metrics';
import SessionLog from './SessionLog';
import { useHistoryStore } from '@/plugins/history/store';
import { startup } from '@/startup';
import { globRegister } from '@/utils/component-ref';
import { Plugin } from 'vue';

const plugin: Plugin = {
  install(app) {
    const historyStore = useHistoryStore();
    globRegister(
      app,
      import.meta.glob('./components/**/*.vue', { eager: true }),
    );

    app.use(Graph);
    app.use(Metrics);
    app.use(SessionLog);

    startup.add(historyStore);
  },
};

export default plugin;
