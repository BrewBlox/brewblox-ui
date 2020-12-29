<script lang="ts">
import isString from 'lodash/isString';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/DialogBase';
import { createDialog } from '@/helpers/dialog';
import { suggestId } from '@/helpers/functional';
import { loadFile, saveFile } from '@/helpers/import-export';
import notify from '@/helpers/notify';
import { blockIdRules } from '@/plugins/spark/helpers';
import { SparkServiceModule, sparkStore } from '@/plugins/spark/store';
import { Block } from '@/plugins/spark/types';
import { Service, serviceStore } from '@/store/services';

@Component
export default class SparkImportMenu extends DialogBase {
  importBusy = false;
  messages: string[] = [];

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  get service(): Service {
    return serviceStore.serviceById(this.serviceId)!;
  }

  public get sparkModule(): SparkServiceModule {
    return sparkStore.moduleById(this.serviceId)!;
  }

  async exportBlocks(): Promise<void> {
    const exported = await this.sparkModule.serviceExport();
    saveFile(exported, `brewblox-blocks-${this.service.id}.json`);
  }

  startImport(): void {
    loadFile(this.confirmImport);
  }

  confirmImport(values: any): void {
    createDialog({
      component: 'ConfirmDialog',
      title: 'Reset blocks',
      message: 'This will remove all blocks, and import new ones from file. Are you sure?',
      noBackdropDismiss: true,
    })
      .onOk(() => this.importBlocks(values));
  }

  async importBlocks(values: any): Promise<void> {
    try {
      this.importBusy = true;
      this.messages = [];
      this.messages = await this.sparkModule.serviceImport(values);
      this.messages
        .forEach(msg => notify.info('Block import error: ' + msg, { shown: false }));
      notify.done(this.messages.length
        ? 'Block import completed with warnings. See the notification center for details.'
        : 'Block import done!');
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
      await sparkStore.createBlock({
        ...block,
        id,
        nid: undefined,
        serviceId: this.serviceId,
      });
      notify.done(`Imported block '${id}'`);
    } catch (e) {
      notify.error(`Failed to import block: ${e.toString()}`);
    }
    this.importBusy = false;
  }
}
</script>

<template>
  <q-dialog ref="dialog" :maximized="$dense" v-bind="dialogProps" @hide="onDialogHide">
    <ActionCardWrapper v-bind="{context}">
      <template #toolbar>
        <DialogToolbar :title="serviceId" subtitle="Import/Export blocks" />
      </template>

      <q-card-section>
        <div class="column q-gutter-y-sm">
          <q-btn
            :loading="importBusy"
            outline
            label="Import single block"
            class="col-auto full-width"
            @click="startImportSingle"
          />
          <q-btn
            :loading="importBusy"
            outline
            label="Import blocks"
            class="col-auto full-width"
            @click="startImport"
          />
          <q-btn
            :loading="importBusy"
            outline
            label="Export blocks"
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
    </ActionCardWrapper>
  </q-dialog>
</template>
