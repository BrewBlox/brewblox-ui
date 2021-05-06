import { boot } from 'quasar/wrappers';
import { Plugin } from 'vue';

import builder from '@/plugins/builder';
import history from '@/plugins/history';
import misc from '@/plugins/misc';
import quickstart from '@/plugins/quickstart';
import spark from '@/plugins/spark';
import tilt from '@/plugins/tilt';
import wizardry from '@/plugins/wizardry';
import { startup } from '@/startup';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';
import { widgetStore } from '@/store/widgets';

interface Startable {
  start(): Promise<void>;
}

export default boot(({ app, store }) => {

  const plugins: Plugin[] = [
    wizardry,
    history,
    spark,
    tilt,
    builder,
    quickstart,
    misc,
  ];

  const started: Startable[] = [
    systemStore,
    serviceStore,
    dashboardStore,
    widgetStore,
  ];

  started.forEach(store => startup.onStart(store.start));
  plugins.forEach(plugin => app.use(plugin, { store }));
});
