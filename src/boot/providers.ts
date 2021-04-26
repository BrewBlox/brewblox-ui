import { Screen } from 'quasar';
import { boot } from 'quasar/wrappers';
import { computed, ref } from 'vue';

import { DenseKey, NowKey, TouchKey } from '@/symbols';

export default boot(({ app }) => {
  const now = ref<Date>(new Date());
  setInterval(() => now.value = new Date(), 10 * 1000);

  const dense = computed<boolean>(
    () => Screen.lt.md,
  );

  app.provide(DenseKey, dense);
  app.provide(TouchKey, ref(document.body.classList.contains('touch')));
  app.provide(NowKey, now);
});
