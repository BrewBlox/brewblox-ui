<script lang="ts">
import FileSaver from 'file-saver';
import get from 'lodash/get';
import { Dialog } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

import DialogBase from '@/components/Dialog/DialogBase';
import { deserialize, serialize } from '@/helpers/units/parseObject';
import sparkStore from '@/plugins/spark/store';
import serviceStore from '@/store/services';


@Component
export default class SparkImportMenu extends DialogBase {

  @Prop({ type: String, required: true })
  readonly serviceId!: string;

  reader: FileReader = new FileReader();
  serializedData: string = '';
  importBusy: boolean = false;
  messages: string[] = [];

  get service() {
    return serviceStore.serviceById(this.serviceId);
  }

  async exportBlocks() {
    const exported = await sparkStore.serviceExport(this.service.id);
    const serialized = JSON.stringify(serialize(exported));
    const blob = new Blob([serialized], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `brewblox-blocks-${this.service.id}.json`);
  }

  handleImportFileSelect(evt) {
    const file = evt.target.files[0];
    if (file) {
      this.reader.readAsText(file);
    } else {
      this.serializedData = '';
    }
  }

  startImportBlocks() {
    Dialog.create({
      title: 'Reset Blocks',
      message: 'This will remove all Blocks, and import new ones from file. Are you sure?',
      dark: true,
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => this.importBlocks());
  }

  async importBlocks() {
    try {
      this.importBusy = true;
      this.messages = [];
      const exported = deserialize(JSON.parse(this.serializedData));
      this.messages = await sparkStore.serviceImport([this.service.id, exported]);
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

  mounted() {
    this.reader.onload = e => this.serializedData = get(e, 'target.result', '');
  }
}
</script>

<template>
  <q-dialog ref="dialog" no-backdrop-dismiss @hide="onDialogHide">
    <q-card dark class="widget-modal">
      <DialogToolbar @close="onDialogHide">
        <q-item-section>
          <q-item-label>{{ service.id }}</q-item-label>
          <q-item-label caption>Import/Export Blocks</q-item-label>
        </q-item-section>
      </DialogToolbar>

      <q-card-section>
        <q-item dark>
          <q-item-section>
            <input type="file" @change="handleImportFileSelect">
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn
              :disable="!serializedData"
              :loading="importBusy"
              outline
              label="Import Blocks from file"
              @click="startImportBlocks"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn :loading="importBusy" outline label="Export Blocks" @click="exportBlocks"/>
          </q-item-section>
        </q-item>
        <q-item v-if="messages.length > 0" dark>
          <q-item-section>
            Reported problems during last import:
            <ul>
              <li v-for="(msg, idx) in messages" :key="idx">{{ msg }}</li>
            </ul>
          </q-item-section>
        </q-item>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
