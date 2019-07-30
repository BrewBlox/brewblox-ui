import './quasar';

import PortalVue from 'portal-vue';
import Vue, { PluginObject } from 'vue';

import App from './App.vue';
import createContainer from './create-container';
import { autoRegister, externalComponent } from './helpers/component-ref';
import { initDb } from './helpers/database';
import builder from './plugins/builder';
import example from './plugins/example';
import history from './plugins/history';
import spark from './plugins/spark';
import router from './router';
import store from './store';

const HOST = process.env.VUE_APP_API_URI || window.location.origin;
const DB_NAME = 'brewblox-ui-store';

Vue.config.performance = (process.env.NODE_ENV === 'development');
autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
initDb(HOST, DB_NAME);

const plugins: PluginObject<any>[] = [
  PortalVue,
  history,
  spark,
  builder,
  example,
];

const external = [
  'brewblox-plugin',
];

const run = async () => {
  const loaded = await Promise
    .all(
      external
        .map(n => `http://localhost:8200/${n}.umd.js`)
        .map(externalComponent)
    );

  [...plugins, ...loaded]
    .forEach(plugin => Vue.use(plugin, { store }));

  new Vue({
    router,
    store,
    el: createContainer('q-app'),
    render: h => h(App),
  });
};

run();
