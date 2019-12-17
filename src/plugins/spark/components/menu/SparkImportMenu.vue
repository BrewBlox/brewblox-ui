<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog, showImportDialog } from '@/helpers/dialog';
import { suggestId } from '@/helpers/functional';
import { saveFile } from '@/helpers/import-export';
import { blockIdRules } from '@/plugins/spark/helpers';
import { sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { Service, serviceStore } from '@/store/services';

@Component
export default class SparkImportMenu extends DialogBase {
  importBusy = false;
  messages: string[] = [];

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service(): Service {
    return serviceStore.serviceById(this.serviceId);
  }

  async exportBlocks(): Promise<void> {
    const exported = await sparkStore.serviceExport(this.service.id);
    saveFile(exported, `brewblox-blocks-${this.service.id}.json`);
  }

  startImport(): void {
    showImportDialog(this.confirmImport);
  }

  confirmImport(values: any): void {
    createDialog({
      title: 'Reset Blocks',
      message: 'This will remove all Blocks, and import new ones from file. Are you sure?',
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(() => this.importBlocks(values));
  }

  async importBlocks(values: any): Promise<void> {
    try {
      this.importBusy = true;
      this.messages = [];
      this.messages = await sparkStore.serviceImport([this.service.id, values]);
      this.$q.notify(
        this.messages.length > 0
          ? {
            icon: 'warning',
            color: 'warning',
            message: `Some Blocks could not be imported on ${this.service.id}`,
          }
          : {
            icon: 'mdi-check-all',
            color: 'positive',
            message: `Imported Blocks on ${this.service.id}`,
          });
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to import blocks: ${e.toString()}`,
      });
    }
    this.importBusy = false;
  }

  startImportSingle(): void {
    showImportDialog(this.importSingleBlock);
  }

  validateBlockId(val: string): boolean {
    return !blockIdRules(this.serviceId)
      .map(rule => rule(val))
      .some(isString);
  }

  async importSingleBlock(block: Block): Promise<void> {
    try {
      this.importBusy = true;
      this.messages = [];
      const id = suggestId(block.id ?? 'imported', this.validateBlockId);
      await sparkStore.createBlock([
        this.serviceId,
        {
          ...block,
          id,
          nid: undefined,
          serviceId: this.serviceId,
        },
      ]);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: `Imported ${id}`,
      });
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to import block: ${e.toString()}`,
      });
    }
    this.importBusy = false;
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card class="widget-modal">
      <DialogToolbar>
        <q-item-section>
          <q-item-label>{{ service.id }}</q-item-label>
          <q-item-label caption>
            Import/Export Blocks
          </q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-card-section>
        <q-item>
          <q-item-section>
            <q-btn :loading="importBusy" outline label="Import single Block" @click="startImportSingle" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-btn :loading="importBusy" outline label="Import Blocks" @click="startImport" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-btn :loading="importBusy" outline label="Export Blocks" @click="exportBlocks" />
          </q-item-section>
        </q-item>
        <q-item v-if="messages.length > 0">
          <q-item-section>
            Reported problems during last import:
            <ul>
              <li v-for="(msg, idx) in messages" :key="idx">
                {{ msg }}
              </li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
