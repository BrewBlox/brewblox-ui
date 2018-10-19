import Vue from 'vue';

import createContainer from './create-container';
import './quasar';

import { autoRegister } from './helpers/component-ref';

import router from './router';
import store from './store';

import portal from './plugins/portal';
import units from './plugins/units';
import spark from './plugins/spark';
import history from './plugins/history';

import App from './App.vue';

autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

const plugins = [
  portal,
  units,
  spark,
  history,
];

plugins.forEach(plugin => plugin({
  store,
  router,
}));

const app = new Vue({
  router,
  store,
  el: createContainer('q-app'),
  render: h => h(App),
});
