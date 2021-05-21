<script lang="ts">
import { defineComponent, ref } from 'vue';

import { useGlobals } from '@/composables';


export default defineComponent({
  name: 'ScrollBlocker',
  setup() {
    const { dense } = useGlobals.setup();

    const blocked = ref<boolean>(dense.value);

    return {
      dense,
      blocked,
    };
  },
});
</script>

<template>
  <div
    v-if="dense && blocked"
    class="absolute-top-left fit bg-dark"
    style="opacity: 0.4"
    @touchstart.stop
    @touchend.stop
    @touchmove.stop
  />
  <q-btn
    v-if="dense"
    class="absolute-top-right q-ma-sm"
    round
    unelevated
    :color="blocked ? 'secondary' : 'negative'"
    :icon="blocked ? 'mdi-gesture-swipe-vertical' : 'mdi-gesture-swipe-vertical'"
    @click="blocked = !blocked"
  />
</template>
