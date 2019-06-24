<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';

import BlockCrudComponent from './BlockCrudComponent';

@Component
export default class BlockWidgetToolbar extends BlockCrudComponent {
  graphModalOpen: boolean = false;

  @Prop({ type: Boolean, default: false })
  readonly graph!: boolean;
}
</script>

<template>
  <WidgetToolbar :title="widget.title" :subtitle="displayName">
    <BlockGraph
      v-if="graphModalOpen"
      :value="graphModalOpen"
      :id="widget.id"
      :config.sync="graphCfg"
      @input="v => graphModalOpen = v"
    />

    <q-item-section side>
      <q-btn-dropdown flat split icon="settings" @click="openModal">
        <q-list dark bordered>
          <!-- Global Actions -->
          <ActionItem
            v-if="graph"
            icon="mdi-chart-line"
            label="Show graph"
            @click="graphModalOpen = true"
          />
          <slot name="actions"/>
          <ActionItem icon="refresh" label="Refresh" @click="refreshBlock"/>
          <!-- Widget Actions -->
          <WidgetActions :crud="crud" no-rename/>
          <!-- Block Actions -->
          <q-expansion-item label="Block Actions">
            <q-list dark>
              <slot name="block-actions"/>
              <ActionItem icon="edit" label="Rename Block" @click="startChangeBlockId"/>
              <ActionItem
                v-if="isStoreBlock"
                icon="mdi-cube"
                label="Choose Block"
                @click="startSwitchBlock"
              />
              <ActionItem icon="mdi-information" label="Block Info" @click="startBlockInfo"/>
              <BlockGroupsAction :block="block"/>
              <BlockPresetsAction :block="block"/>
              <ActionItem
                v-if="isStoreBlock"
                icon="delete"
                label="Remove Block"
                @click="startRemoveBlock"
              />
            </q-list>
          </q-expansion-item>
        </q-list>
      </q-btn-dropdown>
    </q-item-section>
  </WidgetToolbar>
</template>

<style scoped>
.dense {
  padding: 0px;
}
</style>
