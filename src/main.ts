import Vue from 'vue';
import * as PortalVue from 'portal-vue';

import createContainer from './create-container';
import './quasar';

import router from './router';
import store from './store';

import pluginI18n from './plugins/i18n';

import App from './App.vue';

Vue.use(PortalVue);

const app = new Vue({
  router,
  store,
  el: createContainer('q-app'),
  render: h => h(App),
});

const plugins = [
  pluginI18n,
];

plugins.forEach(plugin => plugin({
  app, router, store, Vue,
}));
