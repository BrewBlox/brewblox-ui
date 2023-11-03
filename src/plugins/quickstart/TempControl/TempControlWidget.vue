<script setup lang="ts">
import TempControlBasic from './TempControlBasic.vue';
import TempControlFull from './TempControlFull.vue';
import { useContext } from '@/composables';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TempControlWidget',
  components: {
    Basic: TempControlBasic,
    Full: TempControlFull,
  },
  setup() {
    const { context } = useContext.setup();

    return {
      context,
    };
  },
});
</script>

<template>
  <Card>
    <template #toolbar>
      <WidgetToolbar has-mode-toggle />
    </template>

    <component :is="context.mode" />
  </Card>
</template>
