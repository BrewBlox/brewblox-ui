import { boot } from 'quasar/wrappers';
import { Plugin } from 'vue';

// import automation from '@/plugins/automation';
// import builder from '@/plugins/builder';
import { databasePlugin } from '@/plugins/database';
// import eventControl from '@/plugins/event-control';
import { eventbusPlugin } from '@/plugins/eventbus';
import history from '@/plugins/history';
// import misc from '@/plugins/misc';
// import quickstart from '@/plugins/quickstart';
// import spark from '@/plugins/spark';
import { startup, startupPlugin } from '@/plugins/startup';
// import tilt from '@/plugins/tilt';
// import wizardry from '@/plugins/wizardry';
import { dashboardStore } from '@/store/dashboards';
import { serviceStore } from '@/store/services';
import { systemStore } from '@/store/system';

export default boot(({ app, store }) => {
  app.use(startupPlugin);
  app.use(databasePlugin);
  app.use(eventbusPlugin);

  const plugins: Plugin[] = [
    // wizardry,
    // automation,
    history,
    // spark,
    // tilt,
    // builder,
    // eventControl,
    // quickstart,
    // misc,
  ];

  startup.onStart(() => systemStore.start());
  startup.onStart(() => serviceStore.start());
  startup.onStart(() => dashboardStore.start());

  plugins.forEach(plugin => app.use(plugin, { store }));
});
