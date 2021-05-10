<script lang="ts">
import { defineComponent, inject, onErrorCaptured } from 'vue';

import { TitleTeleportRefKey } from '@/symbols';

export default defineComponent({
  name: 'TitleTeleport',
  setup() {
    const titleRef = inject(TitleTeleportRefKey, undefined);

    onErrorCaptured(() => false);

    return {
      titleRef,
    };
  },
});
</script>

<template>
  <teleport v-if="titleRef" :to="titleRef">
    <slot />
  </teleport>
</template>
