<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { suggestId } from '@/helpers/functional';
import { loadFile, saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
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
    loadFile(this.confirmImport);
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
      if (this.messages.length > 0) {
        notify.warn(`Some Blocks could not be imported on ${this.service.id}`);
        this.messages
          .forEach(msg => notify.info('Block import error: ' + msg, { shown: false }));
      }
      else {
        notify.done(`Imported Blocks on ${this.service.id}`);
      }
    } catch (e) {
      notify.error(`Failed to import blocks: ${e.toString()}`);
    }
    this.importBusy = false;
  }

  startImportSingle(): void {
    loadFile(this.importSingleBlock);
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
      notify.done(`Imported block '${id}'`);
    } catch (e) {
      notify.error(`Failed to import block: ${e.toString()}`);
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
        <div class="column q-gutter-y-sm">
          <q-btn
            :loading="importBusy"
            outline
            label="Import single Block"
            class="col-auto full-width"
            @click="startImportSingle"
          />
          <q-btn
            :loading="importBusy"
            outline
            label="Import Blocks"
            class="col-auto full-width"
            @click="startImport"
          />
          <q-btn
            :loading="importBusy"
            outline
            label="Export Blocks"
            class="col-auto full-width"
            @click="exportBlocks"
          />
        </div>
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
