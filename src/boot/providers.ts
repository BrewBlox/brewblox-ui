import { Screen } from 'quasar';
import { boot } from 'quasar/wrappers';
import { ref } from 'vue';

import { DenseKey, TouchKey } from '@/symbols';

// export default ({ Vue }): void => {
//   Vue.mixin({
//     computed: {
//       $dense() {
//         return Screen.lt.md;
//       },
//       $touch() {
//         return document.body.classList.contains('touch');
//       },
//     },
//   });
// };

export default boot(({ app }) => {
  app.provide(DenseKey, ref(Screen.lt.md));
  app.provide(TouchKey, ref(document.body.classList.contains('touch')));
});
