<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

export default defineComponent({
  name: 'RemoveWidgetAction',
  props: {
    icon: {
      type: String,
      default: 'delete',
    },
    label: {
      type: String,
      default: 'Delete widget',
    },
  },
  setup() {
    const { startRemoveWidget } = useWidget.setup();

    return {
      startRemoveWidget,
    };
  },
});
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startRemoveWidget" />
</template>
