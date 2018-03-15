export default [
  {
    path: '/',
    component: () => import('layouts/default.vue'),
    children: [
      { path: '', component: () => import('pages/index.vue') },
      { path: '/blocks', component: () => import('pages/blocks.vue') },
      { path: '/metrics', component: () => import('pages/metrics.vue') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404.vue'),
  },
];
