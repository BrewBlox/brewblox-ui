<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

export default defineComponent({
  name: 'WidgetActions',
  props: {
    ...useWidget.props,
    noRename: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const {
      isVolatileWidget,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    } = useWidget.setup(props.widgetId);

    return {
      isVolatileWidget,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    };
  },
});
</script>

<template>
  <ActionSubmenu v-if="!isVolatileWidget" label="Widget">
    <ActionItem icon="file_copy" label="Copy" @click="startCopyWidget" />
    <ActionItem icon="exit_to_app" label="Move" @click="startMoveWidget" />
    <slot />
    <RenameWidgetAction v-if="!noRename" :widget-id="widgetId" />
    <ActionItem icon="delete" label="Remove" @click="startRemoveWidget" />
  </ActionSubmenu>
</template>
