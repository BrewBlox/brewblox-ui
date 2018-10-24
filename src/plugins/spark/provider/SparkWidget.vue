<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { durationString } from '@/helpers/functional';
import BlockWidget from '@/plugins/spark/components/BlockWidget';
import SparkForm from './SparkForm.vue';
import { Block } from '@/plugins/spark/state';
import {
  SysInfoBlock,
  ProfilesBlock,
  OneWireBusBlock,
  TicksBlock,
} from './state';
import { blockById, profileNames as serviceProfiles } from '@/plugins/spark/store/getters';
import { fetchBlock } from '@/plugins/spark/store/actions';

@Component({
  components: {
    SparkForm,
  },
  props: {
    serviceId: {
      type: String,
      required: true,
    },
  },
})
export default class SparkWidget extends Vue {
  modalOpen: boolean = false;

  sysBlock<T extends Block>(blockId: string) {
    return blockById<T>(this.$store, this.$props.serviceId, blockId);
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
    return serviceProfiles(this.$store, this.$props.serviceId);
  }

  get activeNames() {
    return this.profiles.data.active
      .map(idx => this.profileNames[idx])
      .join(', ');
  }

  get sysDate() {
    return new Date(this.ticks.data.secondsSinceEpoch * 1000).toLocaleString();
  }

  durationString(durationMs: number) {
    return durationString(durationMs);
  }

  fetch() {
    [
      this.sysInfo,
      this.profiles,
      this.oneWireBus,
      this.ticks,
    ]
      .forEach(block => fetchBlock(this.$store, this.$props.serviceId, block));
  }
}
</script>

<template>
  <div>

    <widget-modal
      :isOpen="modalOpen"
      :onClose="() => { this.modalOpen = false; }"
      :title="$props.serviceId"
    >
      <spark-form
        :serviceId="$props.serviceId"
      />
    </widget-modal>

    <widget-toolbar
      :name="$props.serviceId"
      type="Spark Service Configuration"
      :on-refresh="fetch"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-card>
      <q-card-main class="row">

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

      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
