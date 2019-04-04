<script lang="ts">
import { spaceCased } from '@/helpers/functional';
import { serialize, deserialize } from '@/helpers/units/parseObject';
import { Block, UserUnits } from '@/plugins/spark/state';
import FileSaver from 'file-saver';
import get from 'lodash/get';
import {
  saveBlock,
  saveUnits,
  updateGroupNames,
  clearDiscoveredBlocks,
  fetchDiscoveredBlocks,
  writeSavepoint,
  applySavepoint,
  removeSavepoint,
  fetchAll,
  fetchStored,
  resetStored,
  clearBlocks,
} from '@/plugins/spark/store/actions';
import {
  groupNames,
  unitAlternatives,
  units,
  blockValues,
  discoveredBlocks,
  savepoints,
} from '@/plugins/spark/store/getters';
import WiFiSettingsPopup from './WiFiSettingsPopup.vue';
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  oneWireBusType,
  groupsType,
  sysInfoType,
  ticksType,
  wifiType,
  calcWiFiPct,
} from './getters';
import {
  OneWireBusBlock,
  GroupsBlock,
  SysInfoBlock,
  TicksBlock,
  WiFiSettingsBlock,
} from './state';

@Component({
  props: {
    field: {
      type: Object,
      required: true,
    },
  },
  components: {
    WiFiSettingsPopup,
  },
})
export default class SparkForm extends Vue {
  $q: any;
  wifiModal: boolean = false;
  savepointInput: string = '';
  reader: FileReader = new FileReader();
  serializedBlocks: string = '';
  importBusy: boolean = false;

  sysBlock<T extends Block>(blockType: string) {
    return blockValues(this.$store, this.service.id)
      .find(block => block.type === blockType) as T;
  }

  get service() {
    return this.$props.field;
  }

  get sysInfo() {
    return this.sysBlock<SysInfoBlock>(sysInfoType);
  }

  get groups() {
    return this.sysBlock<GroupsBlock>(groupsType);
  }

  get oneWireBus() {
    return this.sysBlock<OneWireBusBlock>(oneWireBusType);
  }

  get ticks() {
    return this.sysBlock<TicksBlock>(ticksType);
  }

  get wifi() {
    return this.sysBlock<WiFiSettingsBlock>(wifiType);
  }

  get groupNames(): string[] {
    return groupNames(this.$store, this.service.id);
  }

  get sysDate() {
    return new Date((this.ticks.data.secondsSinceEpoch || 0) * 1000).toLocaleString();
  }

  get units(): UserUnits {
    return units(this.$store, this.service.id);
  }

  get unitAlternatives() {
    return unitAlternatives(this.$store, this.service.id);
  }

  get signalPct() {
    if (!this.wifi.data.signal) {
      return 0;
    }
    return calcWiFiPct(this.wifi.data.signal);
  }

  get discoveredBlocks() {
    return discoveredBlocks(this.$store, this.service.id);
  }

  get savepoints() {
    return savepoints(this.$store, this.service.id);
  }

  unitAlternativeOptions(name: string) {
    return (this.unitAlternatives[name] || [])
      .map(val => ({ label: val, value: val }));
  }

  saveBlock(block: Block) {
    saveBlock(this.$store, this.service.id, block);
  }

  saveGroupNames(vals: string[] = this.groupNames) {
    updateGroupNames(this.$store, this.service.id, vals);
  }

  saveUnits(vals: UserUnits = this.units) {
    saveUnits(this.$store, this.service.id, vals)
      .catch(reason => this.$q.notify(`Failed to change unit: ${reason}`));
  }

  clearDiscoveredBlocks() {
    clearDiscoveredBlocks(this.$store, this.service.id);
  }

  fetchDiscoveredBlocks() {
    fetchDiscoveredBlocks(this.$store, this.service.id);
  }

  spaceCased(input: string) {
    return spaceCased(input);
  }

  writeSavepoint(point: string) {
    writeSavepoint(this.$store, this.service.id, point);
  }

  applySavepoint(point: string) {
    applySavepoint(this.$store, this.service.id, point);
  }

  removeSavepoint(point: string) {
    removeSavepoint(this.$store, this.service.id, point);
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

  startClearBlocks() {
    this.$q.dialog({
      title: 'Reset Blocks',
      message: 'This will remove all Blocks. Are you sure?',
      noBackdropDismiss: true,
      cancel: true,
    })
      .onOk(async () => this.clearBlocks());
  }

  async clearBlocks() {
    try {
      this.importBusy = true;
      await clearBlocks(this.$store, this.service);
      this.$q.notify({
        icon: 'mdi-check-all',
        color: 'positive',
        message: 'Removed all Blocks',
      });
    } catch (e) {
      this.$q.notify({
        icon: 'error',
        color: 'negative',
        message: `Failed to remove Blocks: ${e.toString()}`,
      });
    }
    this.importBusy = false;
  }

  mounted() {
    this.reader.onload = e => this.serializedBlocks = get(e, 'target.result', '');
    fetchAll(this.$store, this.service);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>{{ service.id }}</FormToolbar>

    <q-card-section>
      <q-expansion-item group="modal" icon="info" label="System Info">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Version</q-item-label>
            <span>{{ sysInfo.data.version }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>IP address</q-item-label>
            <span>{{ wifi.data.ip }}</span>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Device time</q-item-label>
            <span>{{ sysDate }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Time since boot</q-item-label>
            <span>{{ ticks.data.millisSinceBoot | duration }}</span>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Device ID</q-item-label>
            <span style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</span>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="wifi" label="WiFi">
        <q-dialog v-model="wifiModal" no-backdrop-dismiss>
          <WiFiSettingsPopup
            v-if="wifiModal"
            :field="wifi.data"
            :change="v => { wifi.data = v; saveBlock(wifi); }"
          />
        </q-dialog>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Network</q-item-label>
            <span
              class="editable"
              @click="wifiModal = true"
            >{{ wifi.data.ssid || 'click to connect' }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>IP address</q-item-label>
            <span>{{ wifi.data.ip }}</span>
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Signal strength</q-item-label>
            <span>{{ signalPct }}%</span>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-checkbox-multiple-marked" label="Groups">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Active groups</q-item-label>
            <GroupsPopupEdit
              :field="groups.data.active"
              :service-id="service.id"
              :change="v => { groups.data.active = v; saveBlock(groups); }"
            />
          </q-item-section>
        </q-item>

        <div class="row">
          <q-item v-for="(name, idx) in groupNames" :key="idx" dark class="col-4">
            <q-item-section>
              <q-item-label caption>{{ `Group ${idx + 1} name` }}</q-item-label>
              <InputPopupEdit
                :field="name"
                :change="v => { groupNames[idx] = v; saveGroupNames(); }"
                label="Group"
                tag="span"
              />
            </q-item-section>
          </q-item>
        </div>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-temperature-celsius" label="Units">
        <q-item dark>
          <q-item-section v-for="(val, name) in units" :key="name">
            <q-item-label caption>{{ `${spaceCased(name)} unit` }}</q-item-label>
            <SelectPopupEdit
              :field="val"
              :change="v => { units[name] = v; saveUnits(); }"
              :options="unitAlternativeOptions(name)"
              :label="`Preferred ${spaceCased(name)} unit`"
              tag="span"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item
        group="modal"
        icon="mdi-magnify-plus-outline"
        label="Discover new OneWire Blocks"
      >
        <q-item v-if="discoveredBlocks.length !== 0" dark dense>
          <q-item-label caption>Recently discovered:</q-item-label>
        </q-item>
        <q-item v-for="id in discoveredBlocks" :key="id" :inset-level="1" dense dark>
          <q-item-section>{{ id }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn outline label="Search for new devices" @click="fetchDiscoveredBlocks"/>
          </q-item-section>
          <q-item-section>
            <q-btn
              :disable="!discoveredBlocks.length"
              outline
              label="Clear recent"
              @click="clearDiscoveredBlocks"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-content-save-all" label="Savepoints">
        <q-item v-for="point in savepoints" :key="point" dark>
          <q-item-section>{{ point }}</q-item-section>
          <q-item-section side>
            <q-btn flat rounded label="Save" @click="writeSavepoint(point)"/>
          </q-item-section>
          <q-item-section side>
            <q-btn flat rounded label="Load" @click="applySavepoint(point)"/>
          </q-item-section>
          <q-item-section side>
            <q-btn flat rounded label="Delete" @click="removeSavepoint(point)"/>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-input
              v-model="savepointInput"
              :error="savepoints.includes(savepointInput)"
              placeholder="New Savepoint"
              clearable
              dark
            />
          </q-item-section>
          <q-item-section side>
            <q-btn
              :disable="!savepointInput || savepoints.includes(savepointInput)"
              flat
              rounded
              text-color="white"
              label="Create"
              @click="() => { writeSavepoint(savepointInput); savepointInput = ''; }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-file-export" label="Import/Export Blocks">
        <q-item dark>
          <q-item-section>
            <input type="file" @change="handleImportFileSelect">
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn
              :disable="!serializedBlocks"
              :loading="importBusy"
              outline
              label="Load Blocks from file"
              @click="startImportBlocks"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn
              :loading="importBusy"
              outline
              label="Remove all Blocks"
              @click="startClearBlocks"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-btn :loading="importBusy" outline label="Export Blocks" @click="exportBlocks"/>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
