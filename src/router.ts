import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: '/admin', component: () => import('@/pages/AdminPage.vue') },
      { path: '/styles', component: () => import('@/pages/StylesPage.vue') },
      {
        path: '/builder/:routeId',
        component: () => import('@/plugins/builder/BuilderEditor.vue'),
        props: true,
      },
      {
        path: '/builder',
        component: () => import('@/plugins/builder/BuilderIndexPage.vue'),
      },
      {
        path: '/dashboard/:routeId',
        component: () => import('@/pages/DashboardPage.vue'),
        props: true,
      },
      {
        path: '/service/:routeId',
        component: () => import('@/pages/ServicePage.vue'),
        props: true,
      },
      {
        path: '/brewery/:routeId',
        component: () => import('@/plugins/builder/BreweryPage.vue'),
        props: true,
      },
      {
        path: '/graph/:routeId',
        component: () => import('@/plugins/history/GraphPage.vue'),
        props: true,
      },
    ],
  },

  {
    // Always leave this as last one
    path: '/:catchAll(.*)',
    component: () => import('@/pages/404Page.vue'),
  },
];

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createWebHistory('/ui/'),
});

// Strip hash on fresh page loads
// We use the hash to handle back button in dialogs
router.beforeResolve((to, from, next) => {
  from.fullPath === '/' && to.hash.startsWith('#')
    ? next({ path: to.path, hash: '' })
    : next();
});

export default router;
