<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { Unit } from '@/helpers/units';
import { ProcessValueLink } from '@/helpers/units/KnownLinks';
import { filters } from './getters';

@Component
export default class PidForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      inputId: { path: 'data.inputId', default: new ProcessValueLink(null) },
      outputId: { path: 'data.outputId', default: new ProcessValueLink(null) },
      filter: { path: 'data.filter', default: 0 },
      filterThreshold: { path: 'data.filterThreshold', default: new Unit(0, 'delta_degC') },
      enabled: { path: 'data.enabled', default: false },
      kp: { path: 'data.kp', default: new Unit(0, 'celsius') },
      ti: { path: 'data.ti', default: new Unit(0, 'second') },
      td: { path: 'data.td', default: new Unit(0, 'second') },
    };
  }

  get filterOpts() {
    return filters.map((filter, idx) => ({ label: filter, value: idx }));
  }

  afterBlockFetch() {
    this.fetchCompatibleToInputLinks();
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <widget-field
        label="Active profiles"
        icon="settings_input_component"
      >
        <profiles-bar
          v-model="inputValues.profiles"
          :profileNames="profileNames"
        />
      </widget-field>

      <widget-field
        label="Enabled"
        icon="edit"
      >
        <q-toggle
          v-model="inputValues.enabled"
        />
      </widget-field>

      <widget-field
        label="Input / Output"
        icon="edit"
      >
        <q-select
          v-model="inputValues.inputId.id"
          stack-label="Input"
          clearable
          :options="linkOpts(inputValues.inputId)"
        />
        <q-select
          v-model="inputValues.outputId.id"
          stack-label="Output"
          clearable
          :options="linkOpts(inputValues.outputId)"
        />
      </widget-field>

      <widget-field
        label="Filter"
        icon="edit"
      >
        <q-select
          v-model="inputValues.filter"
          stack-label="Filter"
          :options="filterOpts"
        />
        <q-input
          v-model="inputValues.filterThreshold.value"
          stack-label="Threshold"
          type="number"
        />
      </widget-field>

      <widget-field
        label="Kp / Ti / Td"
        icon="edit"
      >
        <q-input
          v-model="inputValues.kp.value"
          :suffix="inputValues.kp.unitNotation"
          stack-label="Kp"
          type="number"
        />
        <q-input
          v-model="inputValues.ti.value"
          :suffix="inputValues.ti.unitNotation"
          stack-label="Ti"
          type="number"
        />
        <q-input
          v-model="inputValues.td.value"
          :suffix="inputValues.ti.unitNotation"
          stack-label="Td"
          type="number"
        />
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
</style>

