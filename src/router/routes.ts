export default [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      { path: '', component: () => import('@/pages/index.vue') },
      { path: '/settings', component: () => import('@/pages/settings.vue') },
      { path: '/blocks', component: () => import('@/pages/blocks.vue') },

      // dynamic pages
      { path: '/dashboard/:id', component: () => import('@/pages/dashboard/DashboardPage.vue') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('@/pages/404.vue'),
  },
];
