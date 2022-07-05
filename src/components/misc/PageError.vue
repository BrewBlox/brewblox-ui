<script lang="ts">
import { defineComponent } from 'vue';

import { startupDone } from '@/user-settings';

export default defineComponent({
  name: 'PageError',
  setup() {
    return {
      startupDone,
    };
  },
});
</script>

<template>
  <div class="text-h5 darkened absolute-center column items-center q-gutter-md">
    <template v-if="startupDone">
      <slot />
    </template>
    <template v-else>
      <q-spinner size="30px" />
      <div>Waiting for datastore...</div>
    </template>
  </div>
</template>
