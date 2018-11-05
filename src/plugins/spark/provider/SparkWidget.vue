<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { serviceById } from '@/store/services/getters';
import { durationString } from '@/helpers/functional';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import { Block } from '@/plugins/spark/state';
import {
  SysInfoBlock,
  ProfilesBlock,
  OneWireBusBlock,
  TicksBlock,
} from './state';
import {
  blocks,
  blockById,
  profileNames,
  discoveredBlocks,
} from '@/plugins/spark/store/getters';
import {
  fetchAll,
  fetchDiscoveredBlocks,
  clearDiscoveredBlocks,
} from '@/plugins/spark/store/actions';
import {
  sysInfoId,
  profilesId,
  oneWireBusId,
  ticksId,
} from './getters';

@Component({
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkWidget extends Vue {
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

  get activeNames() {
    return this.profiles.data.active
      .map(idx => this.profileNames[idx])
      .join(', ');
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  get discoveredBlocks() {
    return discoveredBlocks(this.$store, this.service.id);
  }

  clearDiscoveredBlocks() {
    clearDiscoveredBlocks(this.$store, this.service.id);
  }

  fetchDiscoveredBlocks() {
    fetchDiscoveredBlocks(this.$store, this.service.id);
  }

  durationString(durationMs: number) {
    return durationString(durationMs);
  }

  fetch() {
    fetchAll(this.$store, serviceById(this.$store, this.service.id));
  }
}
</script>

<template>
  <widget-card
    v-if="ready"
    :title="$props.serviceId"
    subTitle="Spark Service Configuration"
    form="SparkForm"
    v-model="service"
    :onRefresh="fetch"
  >

    <widget-field
      label="Device ID"
      icon="devices"
    >
      <big>{{ sysInfo.data.deviceId }}</big>
    </widget-field>

    <widget-field
      label="Active profiles"
      icon="settings_input_component"
    >
      <big>{{ activeNames }}</big>
    </widget-field>

    <widget-field
      label="Time since boot"
      icon="timelapse"
    >
      <big>{{ durationString(ticks.data.millisSinceBoot) }}</big>
    </widget-field>

    <widget-field
      label="Date"
      icon="schedule"
    >
      <big>{{ sysDate }}</big>
    </widget-field>

    <widget-field
      label="Discovered blocks"
      icon="search"
    >
      <q-btn
        label="Refresh"
        @click="fetchDiscoveredBlocks"
      />
      <p
      v-for="id in discoveredBlocks"
      :key="id"
      >
        {{ id }}<br/>
      </p>
      <q-btn
        label="Clear"
        v-if="discoveredBlocks.length"
        @click="clearDiscoveredBlocks"
      />
    </widget-field>

  </widget-card>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
