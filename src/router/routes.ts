export default [
  {
    path: '/',
    component: () => import('layouts/default.vue'),
    children: [
      { path: '', component: () => import('pages/index.vue') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404.vue'),
  },
];
