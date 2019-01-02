<script lang="ts">
import { spaceCased } from '@/helpers/functional';
import { Block, UserUnits } from '@/plugins/spark/state';
import { saveBlock, saveUnits, updateProfileNames } from '@/plugins/spark/store/actions';
import {
  blockById,
  profileNames,
  unitAlternatives,
  units,
} from '@/plugins/spark/store/getters';
import { Notify } from 'quasar';
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
    field: {
      type: Object,
      required: true,
    },
  },
})
export default class SparkForm extends Vue {
  sysBlock<T extends Block>(blockId: string) {
    return blockById<T>(this.$store, this.service.id, blockId);
  }

  get service() {
    return this.$props.field;
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

  get sysDate() {
    return new Date((this.ticks.data.secondsSinceEpoch || 0) * 1000).toString();
  }

  get units(): UserUnits {
    return units(this.$store, this.service.id);
  }

  get unitAlternatives() {
    return unitAlternatives(this.$store, this.service.id);
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

  spaceCased(input: string) {
    return spaceCased(input);
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-btn
      v-close-overlay
      rounded
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <q-card>
      <q-card-title>System Info</q-card-title>
      <q-card-main>
        <q-field class="col" label="Device ID">
          <big>{{ service.id }}</big>
        </q-field>
        <q-field class="col" label="Time since boot">
          <big>{{ ticks.data.millisSinceBoot | duration }}</big>
        </q-field>
        <q-field class="col" label="Date">
          <big>{{ sysDate }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Profiles</q-card-title>
      <q-card-main>
        <q-field class="col" label="Active profiles" orientation="vertical">
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
</template>

<style scoped>
.q-card {
  min-width: 400px;
  width: 100%;
  margin-bottom: 10px;
}
</style>
