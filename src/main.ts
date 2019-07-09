import './quasar';

import Vue from 'vue';

import App from './App.vue';
import createContainer from './create-container';
import { autoRegister } from './helpers/component-ref';
import { initDb } from './helpers/database';
import example from './plugins/example';
import history from './plugins/history';
import portal from './plugins/portal';
import schema from './plugins/schema';
import spark from './plugins/spark';
import router from './router';
import store from './store';

const HOST = process.env.VUE_APP_API_URI || window.location.origin;
const DB_NAME = 'brewblox-ui-store';

Vue.config.performance = (process.env.NODE_ENV === 'development');
autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
initDb(HOST, DB_NAME);

const plugins = [
  portal,
  history,
  spark,
  schema,
  example,
];

plugins.forEach(plugin => plugin());

new Vue({
  router,
  store,
  el: createContainer('q-app'),
  render: h => h(App),
});
