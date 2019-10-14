<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import CrudComponent from './CrudComponent';

@Component
export default class WidgetActions extends CrudComponent {

  @Prop({ type: Boolean, default: false })
  readonly noRename!: boolean;
}
</script>

<template>
  <q-expansion-item v-if="isStoreWidget" label="Widget Actions">
    <q-list dark>
      <slot name="widget-actions" />
      <ActionItem icon="file_copy" label="Copy" @click="startCopyWidget" />
      <ActionItem icon="exit_to_app" label="Move" @click="startMoveWidget" />
      <RenameWidgetAction v-if="!noRename" :crud="crud" />
      <ActionItem icon="delete" label="Delete" @click="startRemoveWidget" />
    </q-list>
  </q-expansion-item>
</template>
