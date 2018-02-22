export default [
  {
    path: '/',
    component: () => import('layouts/default.vue'),
    children: [
      { path: '', component: () => import('pages/index.vue') },
      { path: '/blocks', component: () => import('pages/blocks.vue') },
    ],
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404.vue'),
  },
];
