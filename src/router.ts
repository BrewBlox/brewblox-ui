import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/IndexPage.vue') },

        // dynamic pages
        { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
        { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
        { path: '/service/:id/display', component: () => import('@/pages/RemoteDisplay.vue') },
      ],
    },
  ],
  mode: 'history',
  base: '',
});

export default router;
