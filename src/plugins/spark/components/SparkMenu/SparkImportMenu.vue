<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import serviceStore from '@/store/services';
import FileSaver from 'file-saver';
import get from 'lodash/get';
import { serialize, deserialize } from '@/helpers/units/parseObject';
import { serviceExport, serviceImport } from '@/plugins/spark/store/actions';


@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkImportMenu extends Vue {
  $q: any;
  reader: FileReader = new FileReader();
  serializedData: string = '';
  importBusy: boolean = false;
  messages: string[] = [];

  get service() {
    return serviceStore.serviceById(this.$props.serviceId);
  }

  async exportBlocks() {
    const exported = await serviceExport(this.$store, this.service);
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
    this.$q.dialog({
      title: 'Reset Blocks',
      message: 'This will remove all Blocks, and import new ones from file. Are you sure?',
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
      this.messages = await serviceImport(this.$store, this.service, exported);
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
  <q-card dark class="widget-modal">
    <FormToolbar>
      <q-item-section>
        <q-item-label>{{ service.id }}</q-item-label>
        <q-item-label caption>Import/Export Blocks</q-item-label>
      </q-item-section>
    </FormToolbar>

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
</template>
