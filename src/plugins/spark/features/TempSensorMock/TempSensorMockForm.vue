<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { Unit } from '@/helpers/units';

@Component
export default class TempSensorMockForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      value: { path: 'data.value', default: new Unit(0, 'celsius') },
      connected: { path: 'data.connected', default: false },
    };
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
        label="Connected"
        icon="edit"
      >
        <q-toggle
          v-model="inputValues.connected"
        />
      </widget-field>

      <widget-field
        label="Value"
        icon="edit"
      >
        <q-input
          v-model="inputValues.value.value"
          :suffix="inputValues.value.unitNotation"
          type="number"
        />
      </widget-field>

    </q-card-main>
  </q-card>
</template>

<style scoped>
</style>

