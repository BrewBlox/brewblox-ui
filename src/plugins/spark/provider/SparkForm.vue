<script lang="ts">
import { spaceCased } from '@/helpers/functional';
import { Block, UserUnits } from '@/plugins/spark/state';
import {
  saveBlock,
  saveUnits,
  updateProfileNames,
  clearDiscoveredBlocks,
  fetchDiscoveredBlocks,
} from '@/plugins/spark/store/actions';
import {
  profileNames,
  unitAlternatives,
  units,
  blockValues,
  discoveredBlocks,
} from '@/plugins/spark/store/getters';
import { Notify } from 'quasar';
import WiFiSettingsPopup from './WiFiSettingsPopup.vue';
import Vue from 'vue';
import Component from 'vue-class-component';
import {
  oneWireBusType,
  profilesType,
  sysInfoType,
  ticksType,
  wifiType,
  calcWiFiPct,
} from './getters';
import {
  OneWireBusBlock,
  ProfilesBlock,
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

  get profiles() {
    return this.sysBlock<ProfilesBlock>(profilesType);
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

  get profileNames(): string[] {
    return profileNames(this.$store, this.service.id);
  }

  get sysDate() {
    return new Date((this.ticks.data.secondsSinceEpoch || 0) * 1000).toString();
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

  unitAlternativeOptions(name: string) {
    return (this.unitAlternatives[name] || [])
      .map(val => ({ label: val, value: val }));
  }

  saveBlock(block: Block) {
    saveBlock(this.$store, this.service.id, block);
  }

  saveProfileNames(vals: string[] = this.profileNames) {
    updateProfileNames(this.$store, this.service.id, vals);
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
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar class="unpadded">
      <q-toolbar-title>Spark Service</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>

    <q-collapsible group="modal" class="col-12" icon="help" label="System Info">
      <div>
        <q-field label="Device ID">
          <big>{{ service.id }}</big>
        </q-field>
        <q-field label="Time since boot">
          <big>{{ ticks.data.millisSinceBoot | duration }}</big>
        </q-field>
        <q-field label="Date">
          <big>{{ sysDate }}</big>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="help" label="WiFi">
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

    <q-collapsible group="modal" class="col-12" icon="help" label="Profiles">
      <div>
        <q-field label="Active profiles" orientation="vertical">
          <ProfilesPopupEdit
            :field="profiles.data.active"
            :service-id="service.id"
            :change="v => { profiles.data.active = v; saveBlock(profiles); }"
          />
        </q-field>
        <q-field class="col column" label="Profile names" orientation="vertical">
          <div v-for="(name, idx) in profileNames" :key="idx" class="col row">
            <q-field :label="`Profile ${idx + 1}`" class="col">
              <InputPopupEdit
                :field="name"
                :change="v => { profileNames[idx] = v; saveProfileNames(); }"
                label="Profile"
              />
            </q-field>
          </div>
        </q-field>
      </div>
    </q-collapsible>

    <q-collapsible group="modal" class="col-12" icon="help" label="Units">
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

    <q-collapsible group="modal" class="col-12" icon="help" label="Discovered Blocks">
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

    <div v-if="false">
      <q-card>
        <q-card-title>System Info</q-card-title>
        <q-card-main>
          <q-field label="Device ID">
            <big>{{ service.id }}</big>
          </q-field>
          <q-field label="Time since boot">
            <big>{{ ticks.data.millisSinceBoot | duration }}</big>
          </q-field>
          <q-field label="Date">
            <big>{{ sysDate }}</big>
          </q-field>
        </q-card-main>
      </q-card>
      <q-card>
        <q-card-title>Profiles</q-card-title>
        <q-card-main>
          <q-field label="Active profiles" orientation="vertical">
            <ProfilesPopupEdit
              :field="profiles.data.active"
              :service-id="service.id"
              :change="v => { profiles.data.active = v; saveBlock(profiles); }"
            />
          </q-field>
          <q-field class="col column" label="Profile names" orientation="vertical">
            <div v-for="(name, idx) in profileNames" :key="idx" class="col row">
              <q-field :label="`Profile ${idx + 1}`" class="col">
                <InputPopupEdit
                  :field="name"
                  :change="v => { profileNames[idx] = v; saveProfileNames(); }"
                  label="Profile"
                />
              </q-field>
            </div>
          </q-field>
        </q-card-main>
      </q-card>
      <q-card>
        <q-card-title>Units</q-card-title>
        <q-card-main>
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
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>
