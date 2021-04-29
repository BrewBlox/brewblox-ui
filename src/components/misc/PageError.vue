<script lang="ts">
import { defineComponent } from 'vue';

import { systemStore } from '@/store/system';

export default defineComponent({
  name: 'PageError',
  computed: {
    started() {
      return systemStore.startupDone;
    },
  },
});
</script>

<template>
  <div
    class="text-h5 darkened absolute-center column items-center q-gutter-md"
  >
    <template v-if="started">
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
