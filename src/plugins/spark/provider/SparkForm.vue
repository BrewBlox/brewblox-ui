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

  mounted() {
    fetchAll(this.$store, this.service);
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar>Spark Service</FormToolbar>

    <q-card-section>
      <q-expansion-item group="modal" icon="info" label="System Info">
        <q-item dark>
          <q-item-section>Device ID</q-item-section>
          <q-item-section>{{ sysInfo.data.deviceId }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Time since boot</q-item-section>
          <q-item-section>{{ ticks.data.millisSinceBoot | duration }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Device time</q-item-section>
          <q-item-section>{{ sysDate }}</q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Version</q-item-section>
          <q-item-section>{{ sysInfo.data.version }}</q-item-section>
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
          <q-item-section>Network</q-item-section>
          <q-item-section>
            <big
              class="editable"
              @click="wifiModal = true"
            >{{ wifi.data.ssid || 'click to connect' }}</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Signal strength</q-item-section>
          <q-item-section>
            <big>{{ signalPct }}%</big>
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>IP address</q-item-section>
          <q-item-section>
            <big>{{ wifi.data.ip }}</big>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-checkbox-multiple-marked" label="Groups">
        <q-item dark>
          <q-item-section>Active groups</q-item-section>
          <q-item-section>
            <GroupsPopupEdit
              :field="groups.data.active"
              :service-id="service.id"
              :change="v => { groups.data.active = v; saveBlock(groups); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section side>Group names</q-item-section>
          <q-item-section>
            <q-item v-for="(name, idx) in groupNames" :key="idx" dark>
              <q-item-section>{{ `Group ${idx + 1}` }}</q-item-section>
              <q-item-section>
                <InputPopupEdit
                  :field="name"
                  :change="v => { groupNames[idx] = v; saveGroupNames(); }"
                  label="Group"
                />
              </q-item-section>
            </q-item>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-temperature-celsius" label="Units">
        <q-item dark>
          <q-item-section side>Unit preferences</q-item-section>
          <q-item-section>
            <q-item v-for="(val, name) in units" :key="name" dark>
              <q-item-section>{{ spaceCased(name) }}</q-item-section>
              <q-item-section>
                <SelectPopupEdit
                  :field="val"
                  :change="v => { units[name] = v; saveUnits(); }"
                  :options="unitAlternativeOptions(name)"
                  label="Preferred unit"
                />
              </q-item-section>
            </q-item>
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-magnify-plus-outline" label="Discovered Blocks">
        <q-item dark>
          <q-item-section>
            <q-btn outline label="Refresh" @click="fetchDiscoveredBlocks"/>
          </q-item-section>
          <q-item-section>
            <q-btn
              :disable="!discoveredBlocks.length"
              outline
              label="Clear"
              @click="clearDiscoveredBlocks"
            />
          </q-item-section>
        </q-item>
        <q-item v-for="id in discoveredBlocks" :key="id" :inset-level="1" dark>
          <q-item-section>{{ id }}</q-item-section>
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
    </q-card-section>
  </q-card>
</template>
