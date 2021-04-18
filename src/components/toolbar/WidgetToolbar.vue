<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';

export default defineComponent({
  name: 'WidgetToolbar',
  setup() {
    const { inDialog } = useContext.setup();
    return {
      inDialog,
    };
  },
});
</script>

<template>
  <DialogWidgetToolbar v-if="inDialog" v-bind="$attrs" />
  <DashboardWidgetToolbar v-else v-bind="$attrs" />
</template>
