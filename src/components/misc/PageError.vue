<script lang="ts">
import { defineComponent } from 'vue';

import { systemStore } from '@/store/system';

export default defineComponent({
  name: 'PageError',
  computed: {
    loaded() {
      return systemStore.loaded;
    },
  },
});
</script>

<template>
  <div
    class="text-h5 darkened absolute-center column items-center q-gutter-md"
  >
    <template v-if="loaded">
      <slot />
    </template>
    <template v-else>
      <q-spinner size="30px" />
      <div>
        Waiting for datastore...
      </div>
    </template>
  </div>
</template>
