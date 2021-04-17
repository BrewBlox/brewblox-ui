<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WidgetToolbar',
  props: {
    inDialog: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<template>
  <DialogWidgetToolbar v-if="inDialog" v-bind="$attrs" />
  <DashboardWidgetToolbar v-else v-bind="$attrs" />
</template>
