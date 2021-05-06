<script lang="ts">
import { defineComponent } from 'vue';

import { getNumDialogs } from '@/utils/dialog';

export default defineComponent({
  name: 'DialogToolbar',
  emits: ['close'],
  setup() {
    const numDialogs = getNumDialogs();

    return {
      numDialogs,
    };
  },
});
</script>

<template>
  <Toolbar class="q-pa-none" v-bind="$attrs">
    <slot />
    <template #buttons>
      <slot name="buttons" />
      <q-btn
        v-close-popup
        flat
        round
        dense
        :icon="numDialogs > 1
          ? 'mdi-arrow-left-circle'
          : 'mdi-close-circle'"
        class="close-button"
        @click="$emit('close')"
      />
    </template>
  </Toolbar>
</template>
