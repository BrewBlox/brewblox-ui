<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

export default defineComponent({
  name: 'RenameWidgetAction',
  props: {
    ...useWidget.props,
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
    const { startChangeWidgetTitle } = useWidget.setup(props.widgetId);

    return {
      startChangeWidgetTitle,
    };
  },
});
</script>

<template>
  <ActionItem v-bind="{...$attrs, ...$props}" @click="startChangeWidgetTitle" />
</template>
