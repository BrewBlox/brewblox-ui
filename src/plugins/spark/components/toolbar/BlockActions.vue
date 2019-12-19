<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '../BlockCrudComponent';

@Component
export default class BlockActions extends BlockCrudComponent { }
</script>

<template>
  <ActionSubmenu label="Block">
    <slot name="block-actions" />
    <ActionItem
      v-if="!crud.isStoreWidget"
      icon="mdi-widgets"
      label="Make widget"
      @click="startMakeWidget"
    />
    <ActionItem icon="edit" label="Rename" @click="startChangeBlockId" />
    <BlockGroupsAction v-if="!crud.isStoreWidget" :crud="crud" />
    <ActionItem icon="mdi-file-export" label="Export" @click="exportBlock" />
    <RemoveBlockAction v-if="!crud.isStoreWidget" :crud="crud" />
  </ActionSubmenu>
</template>
