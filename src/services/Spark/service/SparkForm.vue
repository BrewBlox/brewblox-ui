<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import ProfilesBar from '@/services/Spark/components/ProfilesBar.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';

import { Block } from '@/services/Spark/state';
import { blockById, profileNames as serviceProfiles } from '@/services/Spark/store/getters';
import { updateProfileNames, saveBlock } from '@/services/Spark/store/actions';

import {
  SysInfoBlock,
  ProfilesBlock,
  OneWireBusBlock,
  TicksBlock,
} from './state';
import {
  sysInfoId,
  profilesId,
  oneWireBusId,
  ticksId,
} from './getters';

@Component({
  components: {
    ProfilesBar,
    WidgetField,
  },
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkForm extends Vue {
  sysBlock<T extends Block>(blockId: string) {
    return blockById<T>(this.$store, this.$props.serviceId, blockId);
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
    return serviceProfiles(this.$store, this.$props.serviceId);
  }

  get activeNames() {
    return this.profiles.data.active
      .map(idx => this.profileNames[idx])
      .join(', ');
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toString();
  }

  get activeProfiles(): number[] {
    return [...this.profiles.data.active];
  }

  set activeProfiles(values: number[]) {
    saveBlock(
      this.$store,
      this.$props.serviceId,
      {
        ...this.profiles,
        data: {
          ...this.profiles.data,
          active: values,
        },
      },
    );
  }

  updateNames() {
    updateProfileNames(this.$store, this.$props.serviceId, [...this.profileNames]);
  }
}
</script>

<template>
  <q-card>
    <q-card-main class="column">

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
        <profiles-bar
          v-model="activeProfiles"
          :profileNames="profileNames"
        />
      </widget-field>

      <widget-field
        label="Profile names"
        icon="edit"
      >
        <q-input
          v-for="(name, idx) in profileNames"
          :key="idx"
          v-model="profileNames[idx]"
          @change="updateNames"
          :suffix="`Profile ${idx + 1}`"
        />
      </widget-field>

      <widget-field
        label="Time since boot"
        icon="timelapse"
      >
        <big>{{ ticks.data.millisSinceBoot }}</big> ms
      </widget-field>

      <widget-field
        label="Date"
        icon="schedule"
      >
        <big>{{ sysDate }}</big>
      </widget-field>

    </q-card-main>
  </q-card>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
