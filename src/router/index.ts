import Vue from 'vue';
import VueRouter from 'vue-router';

import routes from './routes';

Vue.use(VueRouter);

const router = new VueRouter({
  routes,
  mode: 'history',
  base: '',
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

export default router;
