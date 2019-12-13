<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from '@/components/CrudComponent';

@Component
export default class WidgetActions extends CrudComponent {

  @Prop({ type: Boolean, default: false })
  readonly noRename!: boolean;
}
</script>

<template>
  <ActionSubmenu v-if="isStoreWidget" label="Widget">
    <ActionItem icon="file_copy" label="Copy" @click="startCopyWidget" />
    <ActionItem icon="exit_to_app" label="Move" @click="startMoveWidget" />
    <slot />
    <RenameWidgetAction v-if="!noRename" :crud="crud" />
    <ActionItem icon="delete" label="Delete" @click="startRemoveWidget" />
  </ActionSubmenu>
</template>
