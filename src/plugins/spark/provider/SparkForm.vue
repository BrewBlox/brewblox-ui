<script lang="ts">
import { spaceCased } from '@/helpers/functional';
import { Block, UserUnits } from '@/plugins/spark/state';
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
} from '@/plugins/spark/store/actions';
import {
  groupNames,
  unitAlternatives,
  units,
  blockValues,
  discoveredBlocks,
  savepoints,
} from '@/plugins/spark/store/getters';
import { Notify } from 'quasar';
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
  wifiModal: boolean = false;
  savepointInput: string = '';

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
      .catch(reason => Notify.create(`Failed to change unit: ${reason}`));
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

  mounted() {
    fetchAll(this.$store, this.service);
  }
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>Spark Service</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>

    <q-collapsible group="modal" class="col-12" icon="info" label="System Info">
      <div>
        <q-field label="Device ID">
          <div>{{ sysInfo.data.deviceId }}</div>
        </q-field>
        <q-field label="Time since boot">
          <div>{{ ticks.data.millisSinceBoot | duration }}</div>
        </q-field>
        <q-field label="Device time">
          <div>{{ sysDate }}</div>
        </q-field>
        <q-field label="Version">
          <div>{{ sysInfo.data.version }}</div>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="wifi" label="WiFi">
      <q-modal v-model="wifiModal">
        <WiFiSettingsPopup
          v-if="wifiModal"
          :field="wifi.data"
          :change="v => { wifi.data = v; saveBlock(wifi); }"
        />
      </q-modal>
      <div>
        <q-field label="Network">
          <big class="editable" @click="wifiModal = true">{{ wifi.data.ssid || 'click to connect' }}</big>
        </q-field>
        <q-field label="Signal strength">
          <big>{{ signalPct }}%</big>
        </q-field>
        <q-field label="IP address">
          <big>{{ wifi.data.ip }}</big>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-checkbox-multiple-marked" label="Groups">
      <div>
        <q-field label="Active groups" orientation="vertical">
          <GroupsPopupEdit
            :field="groups.data.active"
            :service-id="service.id"
            :change="v => { groups.data.active = v; saveBlock(groups); }"
          />
        </q-field>
        <q-field class="col column" label="Group names" orientation="vertical">
          <div v-for="(name, idx) in groupNames" :key="idx" class="col row">
            <q-field :label="`Group ${idx + 1}`" class="col">
              <InputPopupEdit
                :field="name"
                :change="v => { groupNames[idx] = v; saveGroupNames(); }"
                label="Group"
              />
            </q-field>
          </div>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-temperature-celsius" label="Units">
      <div>
        <q-field class="col column" label="Unit preferences" orientation="vertical">
          <q-field v-for="(val, name) in units" :key="name" :label="spaceCased(name)" class="col">
            <SelectPopupEdit
              :field="val"
              :change="v => { units[name] = v; saveUnits(); }"
              :options="unitAlternativeOptions(name)"
              label="Preferred unit"
            />
          </q-field>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible
      group="modal"
      class="col-12"
      icon="mdi-magnify-plus-outline"
      label="Discovered Blocks"
    >
      <div>
        <q-field class="col column" label="Discovered blocks" orientation="vertical">
          <div class="row">
            <q-btn label="Refresh" @click="fetchDiscoveredBlocks"/>
            <q-btn v-if="discoveredBlocks.length" label="Clear" @click="clearDiscoveredBlocks"/>
          </div>
          <p v-for="id in discoveredBlocks" :key="id">{{ id }}</p>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="mdi-content-save-all" label="Savepoints">
      <q-list no-border separator>
        <q-item v-for="point in savepoints" :key="point">
          <q-item-main>{{ point }}</q-item-main>
          <q-item-side right>
            <q-btn flat rounded label="Save" @click="writeSavepoint(point)"/>
            <q-btn flat rounded label="Load" @click="applySavepoint(point)"/>
            <q-btn flat rounded label="Delete" @click="removeSavepoint(point)"/>
          </q-item-side>
        </q-item>
        <q-item>
          <q-item-main>
            <q-input
              v-model="savepointInput"
              :error="savepoints.includes(savepointInput)"
              placeholder="New Savepoint"
              clearable
            />
          </q-item-main>
          <q-item-side right>
            <q-btn
              :disable="!savepointInput || savepoints.includes(savepointInput)"
              flat
              rounded
              label="Create"
              @click="() => { writeSavepoint(savepointInput); savepointInput = ''; }"
            />
          </q-item-side>
        </q-item>
      </q-list>
    </q-collapsible>
  </div>
</template>

<style scoped>
.savepoint-grid {
  display: grid;
  align-content: center;
  grid-gap: 15px;
  grid-template-columns: auto auto auto auto;
}
</style>
