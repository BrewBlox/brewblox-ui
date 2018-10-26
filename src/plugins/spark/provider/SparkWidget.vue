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
  blockById,
  profileNames,
  discoveredBlocks,
} from '@/plugins/spark/store/getters';
import {
  fetchAll,
  fetchDiscoveredBlocks,
  clearDiscoveredBlocks,
} from '@/plugins/spark/store/actions';

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
    return blockById<T>(this.$store, this.service.id, blockId);
  }

  get sysInfo() {
    return this.sysBlock<SysInfoBlock>('__sysinfo');
  }

  get profiles() {
    return this.sysBlock<ProfilesBlock>('__profiles');
  }

  get oneWireBus() {
    return this.sysBlock<OneWireBusBlock>('__onewirebus');
  }

  get ticks() {
    return this.sysBlock<TicksBlock>('__time');
  }

  get profileNames(): string[] {
    return profileNames(this.$store, this.service.id);
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
      <p v-else>
        -
      </p>
    </widget-field>

  </widget-card>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
