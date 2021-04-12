<script lang="ts">
import { defineComponent } from 'vue';

import { useCrud } from '@/composables';

export default defineComponent({
  name: 'RemoveWidgetAction',
  props: {
    ...useCrud.props,
    icon: {
      type: String,
      default: 'delete',
    },
    label: {
      type: String,
      default: 'Delete widget',
    },
  },
  setup(props) {
    const { startRemoveWidget } = useCrud.setup(props.crud);

    return {
      startRemoveWidget,
    };
  },
});
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startRemoveWidget" />
</template>
