import './quasar';

import PortalVue from 'portal-vue';
import Vue, { PluginObject } from 'vue';

import App from './App.vue';
import createContainer from './create-container';
import { autoRegister, externalComponent } from './helpers/component-ref';
import { initDb } from './helpers/database';
import builder from './plugins/builder';
import history from './plugins/history';
import spark from './plugins/spark';
import router from './router';
import store from './store';
import { UIPlugin, pluginStore } from './store/plugins';

const HOST = process.env.VUE_APP_API_URI || window.location.origin;
const DB_NAME = 'brewblox-ui-store';

Vue.config.performance = (process.env.NODE_ENV === 'development');
autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
initDb(HOST, DB_NAME);

const localPlugins: PluginObject<any>[] = [
  PortalVue,
  history,
  spark,
  builder,
];

const loadRemotePlugin = async (plugin: UIPlugin): Promise<PluginObject<any>> => {
  try {
    const obj = await externalComponent(plugin.url);
    pluginStore.commitResult({ id: plugin.id, loaded: true, error: null });
    return obj;
  } catch (e) {
    pluginStore.commitResult({ id: plugin.id, loaded: false, error: e.toString() });
    // return a dummy so we don't have to filter the list before calling Vue.use()
    return { install: () => { } };
  }
};

const run = async () => {
  await pluginStore.setup();
  const remotePlugins = await pluginStore.fetchPlugins();

  const loaded = await Promise
    .all(remotePlugins.map(loadRemotePlugin));

  [...localPlugins, ...loaded]
    .forEach(plugin => Vue.use(plugin, { store }));

  new Vue({
    router,
    store,
    el: createContainer('q-app'),
    render: h => h(App),
  });
};

run();
