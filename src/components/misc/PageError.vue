<script lang="ts">
import { computed,defineComponent } from 'vue';

import { useSystemStore } from '@/store/system';

export default defineComponent({
  name: 'PageError',
  setup() {
    const systemStore = useSystemStore();
    const started = computed<boolean>(() => systemStore.startupDone);
    return {
      started,
    };
  },
});
</script>

<template>
  <div class="text-h5 darkened absolute-center column items-center q-gutter-md">
    <template v-if="started">
      <slot />
    </template>
    <template v-else>
      <q-spinner size="30px" />
      <div>Waiting for datastore...</div>
    </template>
  </div>
</template>
