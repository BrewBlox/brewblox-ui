<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Notify } from 'quasar';
import ProfilesBar from '@/plugins/spark/components/ProfilesBar.vue';
import WidgetField from '@/components/Widget/WidgetField.vue';
import { toShadow, fromShadow, ShadowMapping, deepCopy } from '@/helpers/shadow-copy';
import { Block, UserUnits } from '@/plugins/spark/state';
import { blockById, profileNames as serviceProfiles, units } from '@/plugins/spark/store/getters';
import { updateProfileNames, saveBlock, saveUnits } from '@/plugins/spark/store/actions';

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
import { Watch } from 'vue-property-decorator';

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
  inputValues: { [key: string]: any; } = {};
  inputMapping: ShadowMapping = {
    deviceId: { path: 'sysInfo.data.deviceId', default: '' },
    activeProfiles: { path: 'profiles.data.active', default: [] },
    profileNames: { path: 'profileNames', default: [] },
    units: { path: 'units', default: {} },
    millisSinceBoot: { path: 'ticks.data.millisSinceBoot', default: 0 },
    secondsSinceEpoch: { path: 'ticks.data.secondsSinceEpoch', default: 0 },
  };

  sysBlock<T extends Block>(blockId: string) {
    return blockById<T>(this.$store, this.$props.serviceId, blockId);
  }

  get stored() {
    return {
      sysInfo: this.sysBlock<SysInfoBlock>(sysInfoId),
      profiles: this.sysBlock<ProfilesBlock>(profilesId),
      oneWireBus: this.sysBlock<OneWireBusBlock>(oneWireBusId),
      ticks: this.sysBlock<TicksBlock>(ticksId),
      profileNames: serviceProfiles(this.$store, this.$props.serviceId),
      units: units(this.$store, this.$props.serviceId),
    };
  }

  get changed(): boolean {
    return JSON.stringify(this.generateShadow()) !== JSON.stringify(this.inputValues);
  }

  get sysDate() {
    return new Date((this.inputValues.secondsSinceEpoch || 0) * 1000).toString();
  }

  generateShadow() {
    return toShadow(this.stored, this.inputMapping);
  }

  changeBlock(block: Block) {
    saveBlock(this.$store, this.$props.serviceId, block);
  }

  confirmChanges() {
    const vals = fromShadow(
      this.inputValues,
      this.inputMapping,
      this.stored,
    );
    this.changeBlock(vals.sysInfo);
    this.changeBlock(vals.profiles);
    this.changeBlock(vals.oneWireBus);
    this.changeBlock(vals.ticks);
    updateProfileNames(this.$store, this.$props.serviceId, vals.profileNames);
    saveUnits(this.$store, this.$props.serviceId, vals.units)
      .catch(reason => Notify.create(`Failed to change unit: ${reason}`));
  }

  @Watch('stored', { immediate: true, deep: true })
  cancelChanges() {
    this.inputValues = deepCopy(this.generateShadow());
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
        <big>{{ inputValues.deviceId }}</big>
      </widget-field>

      <widget-field
        label="Active profiles"
        icon="settings_input_component"
      >
        <profiles-bar
          v-model="inputValues.activeProfiles"
          :profileNames="inputValues.profileNames"
        />
      </widget-field>

      <widget-field
        label="Profile names"
        icon="edit"
      >
        <q-input
          v-for="(name, idx) in inputValues.profileNames"
          :key="idx"
          v-model="inputValues.profileNames[idx]"
          :suffix="`Profile ${idx + 1}`"
        />
      </widget-field>

      <widget-field
        label="Favored units"
        icon="edit"
      >
        <q-input
          v-for="(val, name) in inputValues.units"
          :key="name"
          v-model="inputValues.units[name]"
          :suffix="`${name} units`"
        />
      </widget-field>

      <widget-field
        label="Time since boot"
        icon="timelapse"
      >
        <big>{{ inputValues.millisSinceBoot }}</big> ms
      </widget-field>

      <widget-field
        label="Date"
        icon="schedule"
      >
        <big>{{ sysDate }}</big>
      </widget-field>

    <q-card-separator />
    <q-card-actions align="end">

      <q-btn
        flat
        label="Reset"
        color="primary"
        :disabled="!changed"
        @click="cancelChanges"
      />

      <q-btn
        flat
        label="Save"
        color="primary"
        @click="confirmChanges"
      />

    </q-card-actions>

    </q-card-main>
  </q-card>
</template>

<style scoped>
.q-card {
  display: flex;
}
</style>
