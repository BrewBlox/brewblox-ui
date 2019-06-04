<script lang="ts">
import { Dialog } from 'quasar';
import Vue from 'vue';
import Component from 'vue-class-component';

import sparkStore from '@/plugins/spark/store';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
    graph: {
      type: Boolean,
      default: false,
    },
  },
})
export default class BlockWidgetToolbar extends Vue {
  graphModalOpen: boolean = false;

  get blockId() {
    return this.$props.field.blockId;
  }

  get block() {
    return this.$props.field.block;
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
      .onOk(this.$props.field.changeBlockId);
  }

  chooseBlock() {
    Dialog.create({
      component: 'BlockChoiceDialog',
      title: 'Choose a Block',
      message: 'You can change the Block that will be displayed by this widget',
      filter: block => block.type === this.block.type,
      root: this.$root,
      serviceId: this.block.serviceId,
    })
      .onOk(block => this.$props.field.switchBlockId(block.id));
  }

  blockInfo() {
    Dialog.create({
      component: 'BlockInfoDialog',
      block: this.block,
      root: this.$root,
    });
  }
}
</script>

<template>
  <WidgetToolbar :title="field.widgetTitle" :subtitle="field.displayName">
    <BlockGraph
      v-if="graphModalOpen"
      :value="graphModalOpen"
      :id="field.widgetId"
      :config="field.graphCfg"
      :change="v => field.graphCfg = v"
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
          <ActionItem icon="refresh" label="Refresh" @click="field.refreshBlock"/>
          <slot name="actions"/>
          <!-- Widget Actions -->
          <q-expansion-item label="Widget Actions">
            <q-list dark>
              <slot name="widget-actions"/>
              <ActionItem
                v-if="field.$props.onCopy"
                icon="file_copy"
                label="Copy to widget"
                @click="field.$props.onCopy(field.widgetId)"
              />
              <ActionItem
                v-if="field.$props.onMove"
                icon="exit_to_app"
                label="Move"
                @click="field.$props.onMove(field.widgetId)"
              />
              <ActionItem
                v-if="field.$props.onDelete"
                icon="delete"
                label="Delete"
                @click="field.$props.onDelete(field.widgetId)"
              />
            </q-list>
          </q-expansion-item>
          <!-- Block Actions -->
          <q-expansion-item label="Block Actions">
            <q-list dark>
              <slot name="block-actions"/>
              <ActionItem icon="edit" label="Rename Block" @click="renameBlock"/>
              <ActionItem icon="mdi-cube" label="Choose Block" @click="chooseBlock"/>
              <ActionItem icon="mdi-information" label="Block Info" @click="blockInfo"/>
              <BlockPresetsAction :block="block" :presets="field.presets"/>
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
