<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Notify } from 'quasar';
import { durationString, spaceCased } from '@/helpers/functional';
import { toShadow, fromShadow, ShadowMapping, deepCopy } from '@/helpers/shadow-copy';
import { Block, UserUnits } from '@/plugins/spark/state';
import {
  blockById,
  profileNames as serviceProfiles,
  units,
  unitAlternatives,
} from '@/plugins/spark/store/getters';
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

@Component({
  props: {
    value: {
      type: Object,
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
    return blockById<T>(this.$store, this.service.id, blockId);
  }

  get service() {
    return this.$props.value;
  }

  get stored() {
    return {
      sysInfo: this.sysBlock<SysInfoBlock>(sysInfoId),
      profiles: this.sysBlock<ProfilesBlock>(profilesId),
      oneWireBus: this.sysBlock<OneWireBusBlock>(oneWireBusId),
      ticks: this.sysBlock<TicksBlock>(ticksId),
      profileNames: serviceProfiles(this.$store, this.service.id),
      units: units(this.$store, this.service.id),
    };
  }

  get changed(): boolean {
    return JSON.stringify(this.generateShadow()) !== JSON.stringify(this.inputValues);
  }

  get sysDate() {
    return new Date((this.inputValues.secondsSinceEpoch || 0) * 1000).toString();
  }

  get unitAlternatives() {
    return unitAlternatives(this.$store, this.service.id);
  }

  unitAlternativeOptions(name: string) {
    return (this.unitAlternatives[name] || [])
      .map(val => ({ label: val, value: val }));
  }

  generateShadow() {
    return toShadow(this.stored, this.inputMapping);
  }

  changeBlock(block: Block) {
    saveBlock(this.$store, this.service.id, block);
  }

  confirmChanges() {
    const vals = fromShadow(
      this.inputValues,
      this.inputMapping,
      this.stored,
    );
    // sysInfo / oneWireBus / ticks have no editable fields
    this.changeBlock(vals.profiles);
    updateProfileNames(this.$store, this.service.id, vals.profileNames);
    saveUnits(this.$store, this.service.id, vals.units)
      .catch(reason => Notify.create(`Failed to change unit: ${reason}`));
  }

  @Watch('stored', { immediate: true, deep: true })
  cancelChanges() {
    this.inputValues = deepCopy(this.generateShadow());
  }

  durationString(durationMs: number) {
    return durationString(durationMs);
  }

  spaceCased(input: string) {
    return spaceCased(input);
  }
}
</script>

<template>
  <q-card class="flex-center">
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
        <q-select
          v-for="(val, name) in inputValues.units"
          :key="name"
          :options="unitAlternativeOptions(name)"
          v-model="inputValues.units[name]"
          :suffix="spaceCased(name)"
        />
      </widget-field>

      <widget-field
        label="Time since boot"
        icon="timelapse"
      >
        <big>{{ durationString(inputValues.millisSinceBoot) }}</big>
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
