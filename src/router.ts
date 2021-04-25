import {
  createRouter,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/builder/:id?',
    component: () => import('@/plugins/builder/BuilderEditor.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      //   { path: '/admin', component: () => import('@/pages/AdminPage.vue') },
      { path: '/styles', component: () => import('@/pages/StylesPage.vue') },
      //   // dynamic pages
      { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
      { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
      { path: '/brewery/:id?', component: () => import('@/plugins/builder/BreweryPage.vue') },
    ],
  },

  { // Always leave this as last one
    path: '/:catchAll(.*)',
    component: () => import('@/pages/404.vue'),
  },
];

export default function (/* { store, ssrContext } */): Router {
  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createWebHistory(process.env.VUE_ROUTER_BASE),
  });

  // Strip hash on fresh page loads
  // We use the hash to handle back button in dialogs
  router.beforeResolve((to, from, next) => {
    from.fullPath === '/' && to.hash
      ? next({ path: to.path, hash: '' })
      : next();
  });

  return router;
}
