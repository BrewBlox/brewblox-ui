<script lang="ts">
import { defineComponent } from 'vue';

import { useContext } from '@/composables';

export default defineComponent({
  name: 'BlockWidgetToolbar',
  setup() {
    const { inDialog } = useContext.setup();
    return {
      inDialog,
    };
  },
});
</script>

<template>
  <DialogBlockWidgetToolbar v-if="inDialog" v-bind="$attrs" />
  <DashboardBlockWidgetToolbar v-else v-bind="$attrs" />
</template>
