import Vue from 'vue';
import store from './store';
import App from './App.vue';
import createContainer from './create-container';
import { autoRegister } from './helpers/component-ref';
import { initDb } from './helpers/database';
import history from './plugins/history';
import portal from './plugins/portal';
import spark from './plugins/spark';
import example from './plugins/example';
import './quasar';
import router from './router';

const HOST = process.env.VUE_APP_API_URI || window.location.origin;
const DB_NAME = 'brewblox-ui-store';

autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));
initDb(HOST, DB_NAME);

const plugins = [
  portal,
  spark,
  history,
  example,
];

plugins.forEach(plugin => plugin({
  store,
  router,
}));

new Vue({
  router,
  store,
  el: createContainer('q-app'),
  render: h => h(App),
});
