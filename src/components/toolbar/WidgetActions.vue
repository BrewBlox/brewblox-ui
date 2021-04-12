<script lang="ts">
import { defineComponent } from 'vue';

import { useCrud } from '@/composables';

export default defineComponent({
  name: 'WidgetActions',
  props: {
    ...useCrud.props,
    noRename: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const {
      crud,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    } = useCrud.setup(props.crud);

    return {
      crud,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    };
  },
});
</script>

<template>
  <ActionSubmenu v-if="crud.isStoreWidget" label="Widget">
    <ActionItem icon="file_copy" label="Copy" @click="startCopyWidget" />
    <ActionItem icon="exit_to_app" label="Move" @click="startMoveWidget" />
    <slot />
    <RenameWidgetAction v-if="!noRename" :crud="crud" />
    <ActionItem icon="delete" label="Remove" @click="startRemoveWidget" />
  </ActionSubmenu>
</template>
