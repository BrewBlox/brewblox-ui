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
  <q-expansion-item label="Widget Actions">
    <q-list dark>
      <slot name="widget-actions"/>
      <ActionItem icon="file_copy" label="Copy to widget" @click="startCopyWidget"/>
      <ActionItem v-if="isStoreWidget" icon="exit_to_app" label="Move" @click="startMoveWidget"/>
      <RenameWidgetAction v-if="isStoreWidget && !noRename" :crud="crud"/>
      <ActionItem v-if="isStoreWidget" icon="delete" label="Delete" @click="startRemoveWidget"/>
    </q-list>
  </q-expansion-item>
</template>
