<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

import WidgetToolbar from '@/components/Widget/WidgetToolbar.vue';
import WidgetModal from '@/components/Widget/WidgetModal.vue';
import BlockWidget from '@/services/Spark/components/BlockWidget';
import ProfilesBar from '@/services/Spark/components/ProfilesBar.vue';

import { Block } from '@/services/Spark/state';
import { SysInfoBlock } from '@/services/Spark/features/SysInfo/state';
import { ProfilesBlock } from '@/services/Spark/features/Profiles/state';
import { OneWireBusBlock } from '@/services/Spark/features/OneWireBus/state';
import { TicksBlock } from '@/services/Spark/features/Ticks/state';
import { blockById, profileNames as serviceProfiles } from '@/services/Spark/store/getters';
import { fetchBlock } from '@/services/Spark/store/actions';

@Component({
  components: {
    WidgetToolbar,
    WidgetModal,
    ProfilesBar,
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
      title="PID Settings"
    >
      TEXT
    </widget-modal>

    <widget-toolbar
      :name="$props.serviceId"
      type="Spark Service Configuration"
      :on-refresh="fetch"
      :on-settings="() => { this.modalOpen = true; }"
    />

    <q-card>
      <q-card-main class="row">

        <q-field
          dark
          label="Device ID"
          icon="devices"
          orientation="vertical"
        >
          <big>{{ sysInfo.data.deviceId }}</big>
        </q-field>

        <q-field
          dark
          label="Active profiles"
          icon="settings_input_component"
          orientation="vertical"
        >
          {{ activeNames }}
        </q-field>

       <q-field
          dark
          label="Time since boot"
          icon="timelapse"
          orientation="vertical"
        >
          <big>{{ ticks.data.millisSinceBoot }}</big> ms
        </q-field>

        <q-field
          dark
          label="Time since Epoch"
          icon="schedule"
          orientation="vertical"
        >
          <big>{{ ticks.data.secondsSinceEpoch }}</big> s
        </q-field>

      </q-card-main>
    </q-card>

  </div>
</template>

<style scoped>
.q-card {
  display: flex;
}

.q-field {
  margin-top: 2pt;
  margin-bottom: 10pt;
}
</style>
