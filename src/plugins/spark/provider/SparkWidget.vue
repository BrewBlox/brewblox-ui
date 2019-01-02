<script lang="ts">
import { Block } from '@/plugins/spark/state';
import {
  clearDiscoveredBlocks,
  createUpdateSource,
  fetchAll,
  fetchDiscoveredBlocks,
  saveBlock,
} from '@/plugins/spark/store/actions';
import {
  blocks,
  discoveredBlocks,
  profileNames,
  updateSource,
} from '@/plugins/spark/store/getters';
import { serviceById } from '@/store/services/getters';
import Vue from 'vue';
import Component from 'vue-class-component';
import WiFiSettingsPopup from './WiFiSettingsPopup.vue';
import {
  oneWireBusId,
  profilesId,
  sysInfoId,
  ticksId,
  wifiId,
  isReady,
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
    serviceId: {
      type: String,
      required: true,
    },
  },
  components: {
    WiFiSettingsPopup,
  },
})
export default class SparkWidget extends Vue {
  modalOpen: boolean = false;
  wifiModal: boolean = false;
  slideIndex: number = 0;

  get service() {
    return serviceById(this.$store, this.$props.serviceId);
  }

  sysBlock<T extends Block>(blockId: string) {
    return blocks(this.$store, this.service.id)[blockId] as T;
  }

  get sysInfo() {
    return this.sysBlock<SysInfoBlock>(sysInfoId);
  }

  get profiles() {
    return this.sysBlock<ProfilesBlock>(profilesId);
  }

  get oneWireBus() {
    return this.sysBlock<OneWireBusBlock>(oneWireBusId);
  }

  get ticks() {
    return this.sysBlock<TicksBlock>(ticksId);
  }

  get wifi() {
    return this.sysBlock<WiFiSettingsBlock>(wifiId);
  }

  get profileNames(): string[] {
    return profileNames(this.$store, this.service.id);
  }

  get ready() {
    return isReady(this.$store, this.service.id);
  }

  get updating() {
    return updateSource(this.$store, this.service.id) !== null;
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
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

  get subtitles(): string[] {
    return [
      'State',
      'WiFi',
      'Discovered blocks',
    ];
  }

  get subtitle() {
    return this.subtitles[this.slideIndex] || '';
  }

  navTitle(idx: number) {
    return idx === this.slideIndex
      ? this.subtitles[this.slideIndex]
      : null;
  }

  navIcon(idx: number) {
    return (idx === this.slideIndex && this.navTitle(idx))
      ? null
      : 'fiber_manual_record';
  }

  openModal() {
    this.modalOpen = true;
  }

  clearDiscoveredBlocks() {
    clearDiscoveredBlocks(this.$store, this.service.id);
  }

  fetchDiscoveredBlocks() {
    fetchDiscoveredBlocks(this.$store, this.service.id);
  }

  fetchAll() {
    fetchAll(this.$store, serviceById(this.$store, this.service.id));
  }

  createUpdateSource() {
    createUpdateSource(this.$store, this.service.id);
  }

  saveBlock(block: Block) {
    saveBlock(this.$store, this.service.id, block);
  }
}
</script>

<template>
  <q-card v-if="ready" dark class="column">
    <q-modal v-model="modalOpen">
      <SparkForm v-if="modalOpen" :field="service"/>
    </q-modal>
    <q-modal v-model="wifiModal">
      <WiFiSettingsPopup
        v-if="wifiModal"
        :field="wifi.data"
        :change="v => { wifi.data = v; saveBlock(wifi); }"
      />
    </q-modal>
    <q-card-title class="title-bar">
      <InputPopupEdit
        :field="service.id"
        :change="() => {}"
        class="ellipsis"
        label="Widget ID"
        display="span"
      />
      <span slot="right" class="vertical-middle on-left">Spark Service</span>
      <q-btn slot="right" flat round dense icon="settings" @click="openModal"/>
      <q-btn slot="right" flat round dense icon="refresh" @click="fetchAll"/>
    </q-card-title>
    <q-card-separator/>
    <q-carousel v-model="slideIndex" quick-nav class="col">
      <!-- State -->
      <q-carousel-slide class="unpadded">
        <q-card-main class="column col">
          <q-alert
            v-if="!updating"
            :actions="[{ label: 'Retry', handler: createUpdateSource }]"
            type="warning"
          >Unable to update automatically</q-alert>
          <q-field class="col" label="Device ID">
            <big style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</big>
          </q-field>
          <q-field class="col" label="Active Profiles">
            <ProfilesPopupEdit
              :field="profiles.data.active"
              :service-id="service.id"
              :change="v => { profiles.data.active = v; saveBlock(profiles); }"
            />
          </q-field>
          <q-field class="col" label="Time since boot">
            <big>{{ ticks.data.millisSinceBoot | duration }}</big>
          </q-field>
          <q-field class="col" label="Date">
            <big>{{ sysDate }}</big>
          </q-field>
        </q-card-main>
      </q-carousel-slide>
      <!-- WiFi -->
      <q-carousel-slide class="unpadded">
        <q-card-main class="column col">
          <q-field class="col" label="Network">
            <big
              class="editable"
              @click="wifiModal = true"
            >{{ wifi.data.ssid || 'click to connect' }}</big>
          </q-field>
          <q-field class="col" label="Signal strength">
            <big>{{ signalPct }}%</big>
          </q-field>
          <q-field class="col" label="IP address">
            <big>{{ wifi.data.ip }}</big>
          </q-field>
        </q-card-main>
      </q-carousel-slide>
      <!-- Discovered blocks -->
      <q-carousel-slide class="unpadded">
        <q-card-main class="column col">
          <q-field class="col column" label="Discovered blocks" orientation="vertical">
            <div class="row">
              <q-btn label="Refresh" @click="fetchDiscoveredBlocks"/>
              <q-btn v-if="discoveredBlocks.length" label="Clear" @click="clearDiscoveredBlocks"/>
            </div>
            <p v-for="id in discoveredBlocks" :key="id">{{ id }}</p>
          </q-field>
        </q-card-main>
      </q-carousel-slide>
      <q-btn
        slot-scope="props"
        slot="quick-nav"
        :icon="navIcon(props.slide)"
        :label="navTitle(props.slide)"
        :class="{inactive: !props.current}"
        flat
        dense
        color="white"
        @click="props.goToSlide()"
      />
    </q-carousel>
  </q-card>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
