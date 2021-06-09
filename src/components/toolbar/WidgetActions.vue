<script lang="ts">
import { defineComponent } from 'vue';

import { useWidget } from '@/composables';
import {
  startChangeWidgetTitle,
  startCopyWidget,
  startMoveWidget,
  startRemoveWidget,
} from '@/utils/widgets';

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
      widget,
      isVolatileWidget,
    } = useWidget.setup();

    return {
      widget,
      isVolatileWidget,
      startChangeWidgetTitle,
      startCopyWidget,
      startMoveWidget,
      startRemoveWidget,
    };
  },
});
</script>

<template>
  <ActionSubmenu v-if="!isVolatileWidget" label="Widget">
    <ActionItem
      icon="file_copy"
      label="Copy"
      @click="startCopyWidget(widget)"
    />
    <ActionItem
      icon="exit_to_app"
      label="Move"
      @click="startMoveWidget(widget)"
    />
    <slot />
    <ActionItem
      v-if="!noRename"
      icon="edit"
      label="Rename"
      @click="startChangeWidgetTitle(widget)"
    />
    <ActionItem
      icon="delete"
      label="Remove"
      @click="startRemoveWidget(widget)"
    />
  </ActionSubmenu>
</template>
