<script lang="ts">
import { defineComponent } from 'vue';

import { useCrud } from '@/composables';

export default defineComponent({
  name: 'RenameWidgetAction',
  props: {
    ...useCrud.props,
    icon: {
      type: String,
      default: 'edit',
    },
    label: {
      type: String,
      default: 'Rename',
    },
  },
  setup(props) {
    const { startChangeWidgetTitle } = useCrud.setup(props.crud);

    return {
      startChangeWidgetTitle,
    };
  },
});
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startChangeWidgetTitle" />
</template>
