<script lang="ts">
import { Dialog } from 'quasar';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

import sparkStore from '@/plugins/spark/store';

import BlockWidget from './BlockWidget';

@Component
export default class BlockWidgetToolbar extends Vue {
  @Prop({ type: Object, required: true })
  readonly field!: BlockWidget;

  @Prop({ type: Boolean, default: false })
  readonly graph!: boolean;

  graphModalOpen: boolean = false;

  get blockId() {
    return this.field.blockId;
  }

  get block() {
    return this.field.block;
  }

  get blockOptions() {
    return sparkStore.blockValues(this.block.serviceId)
      .filter(block => block.type === this.block.type)
      .map(block => ({ label: block.id, value: block.id }));
  }

  renameBlock() {
    let blockId = this.blockId;
    Dialog.create({
      title: 'Change Block name',
      message: `Choose a new name for '${this.blockId}'`,
      dark: true,
      cancel: true,
      prompt: {
        model: blockId,
        type: 'text',
      },
    })
      .onOk(this.field.changeBlockId);
  }

  chooseBlock() {
    Dialog.create({
      component: 'BlockDialog',
      title: 'Choose a Block',
      message: 'You can change the Block that will be displayed by this widget',
      filter: block => block.type === this.block.type,
      root: this.$root,
      serviceId: this.block.serviceId,
    })
      .onOk(block => this.field.switchBlockId(block.id));
  }

  blockInfo() {
    Dialog.create({
      component: 'BlockInfoDialog',
      block: this.block,
      root: this.$root,
    });
  }

  removeBlock() {
    Dialog.create({
      title: 'Remove Block',
      message: `Are you sure you want to remove ${this.block.id}?`,
      cancel: true,
      dark: true,
      persistent: true,
    })
      .onOk(() => sparkStore.removeBlock([this.block.serviceId, this.block]));
  }
}
</script>

<template>
  <WidgetToolbar :title="field.widget.title" :subtitle="field.displayName">
    <BlockGraph
      v-if="graphModalOpen"
      :value="graphModalOpen"
      :id="field.widget.id"
      :config.sync="field.graphCfg"
      @input="v => graphModalOpen = v"
    />

    <q-item-section side>
      <q-btn-dropdown flat split icon="settings" @click="field.openModal">
        <q-list dark bordered>
          <!-- Global Actions -->
          <ActionItem
            v-if="graph"
            icon="mdi-chart-line"
            label="Show graph"
            @click="graphModalOpen = true"
          />
          <slot name="actions"/>
          <ActionItem icon="refresh" label="Refresh" @click="field.refreshBlock"/>
          <!-- Widget Actions -->
          <WidgetActions :field="field" no-rename/>
          <!-- Block Actions -->
          <q-expansion-item label="Block Actions">
            <q-list dark>
              <slot name="block-actions"/>
              <ActionItem icon="edit" label="Rename Block" @click="renameBlock"/>
              <ActionItem icon="mdi-cube" label="Choose Block" @click="chooseBlock"/>
              <ActionItem icon="mdi-information" label="Block Info" @click="blockInfo"/>
              <BlockGroupsAction :block="block"/>
              <BlockPresetsAction :block="block"/>
              <ActionItem icon="delete" label="Remove Block" @click="removeBlock"/>
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
