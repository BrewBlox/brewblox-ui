import PortalVue from 'portal-vue';
import { PluginObject } from 'vue';

import { externalComponent } from '@/helpers/component-ref';
import { HOST } from '@/helpers/const';
import automation from '@/plugins/automation';
import builder from '@/plugins/builder';
import database from '@/plugins/database';
import history from '@/plugins/history';
import logging from '@/plugins/logging';
import quickstart from '@/plugins/quickstart';
import spark from '@/plugins/spark';
import store from '@/store';
import { pluginStore, UIPlugin } from '@/store/plugins';

const loadRemotePlugin = async (plugin: UIPlugin): Promise<PluginObject<any>> => {
  try {
    const obj = await externalComponent(plugin.url);
    pluginStore.commitResult({ id: plugin.id, loaded: false, error: null });
    return {
      install: (Vue, { store }) => {
        try {
          Vue.use(obj, { store });
          pluginStore.commitResult({ id: plugin.id, loaded: true, error: null });
        } catch (e) {
          pluginStore.commitResult({ id: plugin.id, loaded: false, error: e.toString() });
        }
      },
    };
  } catch (e) {
    pluginStore.commitResult({ id: plugin.id, loaded: false, error: e.toString() });
    // return a dummy so we don't have to filter the list before calling Vue.use()
    return { install: () => { } };
  }
};

async function setup(Vue): Promise<void> {
  // Make Vue accessible as global variable in plugins
  Object.defineProperty(window, 'Vue', { value: Vue });

  // Enable the Vue devtools performance tab
  Vue.config.performance = process.env.DEV && process.env.BLOX_PERFORMANCE;

  // Install the database. We need it to fetch remote plugins
  Vue.use(database, {
    host: HOST,
    name: 'brewblox-ui-store',
  });

  const plugins: PluginObject<any>[] = [
    PortalVue,
    logging,
    automation,
    history,
    spark,
    builder,
    quickstart,
  ];

  try {
    await pluginStore.init();
    pluginStore.onSetup('services/setup');
    pluginStore.onSetup('dashboards/setup');

    const remotePlugins = await pluginStore.fetchPlugins();
    const loaded = await Promise
      .all(remotePlugins.map(loadRemotePlugin));

    // Append '?safe' to the URL to disable installing remote plugins
    const url = new URL(window.location.href);
    const arg = url.searchParams.get('safe');

    if (arg === null) {
      plugins.push(...loaded);
    }
  } catch (e) { }

  plugins.forEach(plugin => Vue.use(plugin, { store }));
};

export default async ({ Vue }): Promise<void> => {
  await setup(Vue);
};
