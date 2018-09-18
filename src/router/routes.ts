export default [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: '/services', component: () => import('@/pages/ServicesPage.vue') },
      { path: '/blocks', component: () => import('@/pages/SparkPage.vue') },

      // dynamic pages
      { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('@/pages/404.vue'),
  },
];
