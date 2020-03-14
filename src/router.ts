import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const router = new VueRouter({
  routes: [
    {
      path: '/builder/:id?',
      component: () => import('@/plugins/builder/BuilderEditor.vue'),
    },
    {
      path: '/brewery/:id?',
      component: () => import('@/plugins/builder/BreweryPage.vue'),
    },
    {
      path: '/automation/:id?',
      component: () => import('@/plugins/automation/AutomationEditor.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/IndexPage.vue') },
        { path: 'styles', component: () => import('@/pages/StyleGuide.vue') },
        // dynamic pages
        { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
        { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
        { path: '/service/:id/display', component: () => import('@/pages/RemoteDisplay.vue') },
      ],
    },

    { // Always leave this as last one
      path: '*',
      component: () => import('@/pages/404.vue'),
    },
  ],
  mode: 'history',
  base: '/ui/',
});

export default router;
