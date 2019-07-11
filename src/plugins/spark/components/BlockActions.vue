<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from './BlockCrudComponent';

@Component
export default class BlockActions extends BlockCrudComponent { }
</script>

<template>
  <q-expansion-item label="Block Actions">
    <q-list dark>
      <slot name="block-actions" />
      <ActionItem icon="edit" label="Rename Block" @click="startChangeBlockId" />
      <ActionItem
        v-if="isStoreWidget"
        icon="mdi-cube"
        label="Choose Block"
        @click="startSwitchBlock"
      />
      <ActionItem icon="mdi-information" label="Block Info" @click="startBlockInfo" />
      <CloneBlockAction :crud="crud" @close="close" />
      <BlockGroupsAction :crud="crud" @close="close" />
      <BlockPresetsAction :crud="crud" @close="close" />
      <RemoveBlockAction :crud="crud" @close="close" />
    </q-list>
  </q-expansion-item>
</template>
