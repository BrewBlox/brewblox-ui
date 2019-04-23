<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { serviceById } from '@/store/services/getters';
import FileSaver from 'file-saver';
import get from 'lodash/get';
import { serialize, deserialize } from '@/helpers/units/parseObject';
import { fetchStored, resetStored } from '@/plugins/spark/store/actions';


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
  serializedBlocks: string = '';
  importBusy: boolean = false;

  get service() {
    return serviceById(this.$store, this.$props.serviceId);
  }

  async exportBlocks() {
    const stored = await fetchStored(this.$store, this.service);
    const data = JSON.stringify(serialize(stored));
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `brewblox-blocks-${this.service.id}.json`);
  }

  handleImportFileSelect(evt) {
    const file = evt.target.files[0];
    if (file) {
      this.reader.readAsText(file);
    } else {
      this.serializedBlocks = '';
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
      const blocks = deserialize(JSON.parse(this.serializedBlocks));
      await resetStored(this.$store, this.service, blocks);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: 'Imported Blocks',
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
    this.reader.onload = e => this.serializedBlocks = get(e, 'target.result', '');
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
          <q-tooltip>Disabled while we fix some bugs.</q-tooltip>
          <q-btn
            :disable="!serializedBlocks || true"
            :loading="importBusy"
            outline
            label="Load Blocks from file"
            @click="startImportBlocks"
          />
        </q-item-section>
      </q-item>
      <q-item dark>
        <q-item-section>
          <q-btn :loading="importBusy" outline label="Export Blocks" @click="exportBlocks"/>
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
