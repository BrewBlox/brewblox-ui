import Vue from 'vue';
import App from './App.vue';
import './quasar';
import { autoRegister } from './helpers/component-ref';
import history from './plugins/history';
import portal from './plugins/portal';
import spark from './plugins/spark';
import example from './plugins/example';
import router from './router';
import store from './store';

autoRegister(require.context('./components', true, /[A-Z]\w+\.vue$/));

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
  render: h => h(App),
}).$mount('#app');
