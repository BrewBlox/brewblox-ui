import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';

Vue.use(VueRouter);

const Router = new VueRouter({
  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE || 'history',
  base: process.env.VUE_ROUTER_BASE || '',
  routes,
});

/*
// Inform Google Analytics
Router.beforeEach((to, from, next) => {
  if (typeof ga !== 'undefined') {
    ga('set', 'page', to.path)
    ga('send', 'pageview')
  }
  next()
})
*/

export default Router;
