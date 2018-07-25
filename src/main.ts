import Vue from 'vue';

import createContainer from './create-container';
import './quasar';

import router from './router';
import store from './store';

import pluginI18n from './plugins/i18n';
import portal from './plugins/portal';
import units from './plugins/units';

import App from './App.vue';

const app = new Vue({
  router,
  store,
  el: createContainer('q-app'),
  render: h => h(App),
});

const plugins = [
  pluginI18n,
  portal,
  units,
];

plugins.forEach(plugin => plugin({
  app, router, store, Vue,
}));
