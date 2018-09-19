export default [
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },

      // dynamic pages
      { path: '/dashboard/:id', component: () => import('@/pages/DashboardPage.vue') },
      { path: '/service/:id', component: () => import('@/pages/ServicePage.vue') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('@/pages/404.vue'),
  },
];
