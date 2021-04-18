<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';

export default defineComponent({
  name: 'WidgetActions',
  props: {
    noRename: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const {
      isVolatileWidget,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    } = useWidget.setup();

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
    <RenameWidgetAction v-if="!noRename" />
    <ActionItem icon="delete" label="Remove" @click="startRemoveWidget" />
  </ActionSubmenu>
</template>
