<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { Unit } from '@/helpers/units';

@Component
export default class TempSensorOneWireForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      offset: { path: 'data.offset', default: new Unit(0, 'delta_degC') },
      address: { path: 'data.address', default: '' },
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
        label="Address"
        icon="edit"
      >
        <q-input
          v-model="inputValues.address"
          suffix="HEX"
          upper-case
        />
      </widget-field>

      <widget-field
        label="Offset"
        icon="edit"
      >
        <q-input
          v-model="inputValues.offset.value"
          :suffix="inputValues.offset.unitNotation"
          type="number"
        />
      </widget-field>

    </q-card-main>
  </q-card>
</template>

<style scoped>
.centered {
  margin: auto;
}
</style>

