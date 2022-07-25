<script lang="ts">
import { useContext } from '@/composables';
import { defineComponent } from 'vue';
import MutexBasic from './MutexBasic.vue';
import MutexFull from './MutexFull.vue';

export default defineComponent({
  name: 'MutexWidget',
  components: {
    Basic: MutexBasic,
    Full: MutexFull,
  },
  setup() {
    const { context } = useContext.setup();
    return { context };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <BlockWidgetToolbar has-mode-toggle />
    </template>

    <component :is="context.mode" />
  </Card>
</template>
