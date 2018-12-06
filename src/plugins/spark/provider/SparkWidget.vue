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
import {
  oneWireBusId,
  profilesId,
  sysInfoId,
  ticksId,
} from './getters';
import {
  OneWireBusBlock,
  ProfilesBlock,
  SysInfoBlock,
  TicksBlock,
} from './state';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkWidget extends Vue {
  modalOpen: boolean = false;
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

  get profileNames(): string[] {
    return profileNames(this.$store, this.service.id);
  }

  get ready() {
    return [
      this.sysInfo,
      this.profiles,
      this.oneWireBus,
      this.ticks,
    ].every(v => v !== undefined);
  }

  get updating() {
    return updateSource(this.$store, this.service.id) !== null;
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  get discoveredBlocks() {
    return discoveredBlocks(this.$store, this.service.id);
  }

  get subtitles(): string[] {
    return [
      'State',
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
  <div>
    <q-modal v-model="modalOpen">
      <SparkForm v-if="modalOpen" :field="service"/>
    </q-modal>
    <q-card dark class="full-height column" v-if="ready">
      <q-card-title class="title-bar">
        <InputPopupEdit
          class="ellipsis"
          :field="service.id"
          label="Widget ID"
          display="span"
          :change="() => {}"
        />
        <span class="vertical-middle on-left" slot="right">Spark Service</span>
        <q-btn flat round dense slot="right" @click="openModal" icon="settings"/>
        <q-btn flat round dense slot="right" @click="fetchAll" icon="refresh"/>
      </q-card-title>
      <q-card-separator/>
      <q-carousel quick-nav class="col" v-model="slideIndex">
        <!-- State -->
        <q-carousel-slide class="unpadded">
          <q-card-main class="column col">
            <q-alert
              v-if="!updating"
              type="warning"
              :actions="[{ label: 'Retry', handler: createUpdateSource }]"
            >Unable to update automatically</q-alert>
            <q-field class="col" label="Device ID">
              <big style="word-wrap: break-word;">{{ sysInfo.data.deviceId }}</big>
            </q-field>
            <q-field class="col" label="Active Profiles">
              <ProfilesPopupEdit
                :field="profiles.data.active"
                :serviceId="service.id"
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
        <!-- Discovered blocks -->
        <q-carousel-slide class="unpadded">
          <q-card-main class="column col">
            <q-field class="col column" label="Discovered blocks" orientation="vertical">
              <div class="row">
                <q-btn label="Refresh" @click="fetchDiscoveredBlocks"/>
                <q-btn label="Clear" v-if="discoveredBlocks.length" @click="clearDiscoveredBlocks"/>
              </div>
              <p v-for="id in discoveredBlocks" :key="id">{{ id }}</p>
            </q-field>
          </q-card-main>
        </q-carousel-slide>
        <q-btn
          flat
          dense
          slot="quick-nav"
          slot-scope="props"
          color="white"
          :icon="navIcon(props.slide)"
          :label="navTitle(props.slide)"
          @click="props.goToSlide()"
          :class="{inactive: !props.current}"
        />
      </q-carousel>
    </q-card>
  </div>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
