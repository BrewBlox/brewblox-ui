import { boot } from 'quasar/wrappers';
import { Plugin } from 'vue';

// import builder from '@/plugins/builder';
import { databasePlugin } from '@/plugins/database';
import { eventbusPlugin } from '@/plugins/eventbus';
import history from '@/plugins/history';
import misc from '@/plugins/misc';
// import quickstart from '@/plugins/quickstart';
import spark from '@/plugins/spark';
import { startup, startupPlugin } from '@/plugins/startup';
// import tilt from '@/plugins/tilt';
import wizardry from '@/plugins/wizardry';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';
import { widgetStore } from '@/store/widgets';
import { dialogFixPlugin } from '@/utils/dialog';

export default boot(({ app, store }) => {
  app.use(startupPlugin);
  app.use(databasePlugin);
  app.use(eventbusPlugin);

  const plugins: Plugin[] = [
    dialogFixPlugin,
    wizardry,
    history,
    spark,
    // tilt,
    // builder,
    // quickstart,
    misc,
  ];

  startup.onStart(() => systemStore.start());
  startup.onStart(() => serviceStore.start());
  startup.onStart(() => dashboardStore.start());
  startup.onStart(() => widgetStore.start());

  plugins.forEach(plugin => app.use(plugin, { store }));
});
