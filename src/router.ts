import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  Router,
  RouteRecordRaw,
} from 'vue-router';

const routes: RouteRecordRaw[] = [
  // {
  //   path: '/builder/:id?',
  //   component: () => import('@/plugins/builder/BuilderEditor.vue'),
  // },
  // {
  //   path: '/automation/:id?',
  //   component: () => import('@/plugins/automation/AutomationLayout.vue'),
  // },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      //   { path: '/admin', component: () => import('@/pages/AdminPage.vue') },
      { path: '/styles', component: () => import('@/pages/StylesPage.vue') },
      //   // dynamic pages
      { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
      //   { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
      //   { path: '/brewery/:id?', component: () => import('@/plugins/builder/BreweryPage.vue') },
    ],
  },

  { // Always leave this as last one
    path: '/:catchAll(.*)',
    component: () => import('@/pages/404.vue'),
  },
];

export default function (/* { store, ssrContext } */): Router {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE),
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
// Vue.use(VueRouter);

// const router = new VueRouter({
//   routes: [
//     {
//       path: '/builder/:id?',
//       component: () => import('@/plugins/builder/BuilderEditor.vue'),
//     },
//     {
//       path: '/automation/:id?',
//       component: () => import('@/plugins/automation/AutomationLayout.vue'),
//     },
//     {
//       path: '/',
//       component: () => import('@/layouts/DefaultLayout.vue'),
//       children: [
//         { path: '', component: () => import('@/pages/IndexPage.vue') },
//         { path: '/admin', component: () => import('@/pages/AdminPage.vue') },
//         { path: '/styles', component: () => import('@/pages/StylesPage.vue') },
//         // dynamic pages
//         { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
//         { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
//         { path: '/brewery/:id?', component: () => import('@/plugins/builder/BreweryPage.vue') },
//       ],
//     },

//     { // Always leave this as last one
//       path: '*',
//       component: () => import('@/pages/404.vue'),
//     },
//   ],
//   mode: 'history',
//   base: '/ui/',
// });

// // Strip hash on fresh page loads
// // We use the hash to handle back button in dialogs
// router.beforeResolve((to, from, next) => {
//   from.fullPath === '/' && to.hash
//     ? next({ path: to.path, hash: '' })
//     : next();
// });

// export default router;
