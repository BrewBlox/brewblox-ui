<script lang="ts">
import { defineComponent, inject, onErrorCaptured } from 'vue';

import { ButtonsTeleportRefKey } from '@/symbols';

export default defineComponent({
  name: 'ButtonsTeleport',
  setup() {
    const buttonsRef = inject(ButtonsTeleportRefKey, undefined);

    onErrorCaptured(() => false);

    return {
      buttonsRef,
    };
  },
});
</script>

<template>
  <teleport v-if="buttonsRef" :to="buttonsRef">
    <slot />
  </teleport>
</template>
