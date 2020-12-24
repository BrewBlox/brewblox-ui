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
      path: '/automation/:id?',
      component: () => import('@/plugins/automation/AutomationLayout.vue'),
    },
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        { path: '', component: () => import('@/pages/IndexPage.vue') },
        { path: '/config', component: () => import('@/pages/ConfigPage.vue') },
        { path: '/styles', component: () => import('@/pages/StylesPage.vue') },
        // dynamic pages
        { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
        { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
        { path: '/brewery/:id?', component: () => import('@/plugins/builder/BreweryPage.vue') },
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

// Strip query on fresh page loads
// We currently only have support in-page query strings
// If we ever add actual query args, we'll want to extract them here
router.beforeResolve((to, from, next) => {
  from.fullPath === '/' && to.fullPath.includes('?')
    ? next({ path: to.path, query: {} })
    : next();
});

export default router;
