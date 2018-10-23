<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { SetpointLink, TempSensorLink } from '@/helpers/units/KnownLinks';
import { blockIds } from '@/plugins/spark/store/getters';

@Component
export default class SetpointSensorPairForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      setpointId: { path: 'data.setpointId', default: new SetpointLink(null) },
      sensorId: { path: 'data.sensorId', default: new TempSensorLink(null) },
    };
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
        label="Setpoint"
        icon="edit"
      >
        <q-select
          v-model="inputValues.setpointId.id"
          :options="linkOpts(inputValues.setpointId)"
        />
      </widget-field>

      <widget-field
        label="Sensor"
        icon="edit"
      >
        <q-select
          v-model="inputValues.sensorId.id"
          :options="linkOpts(inputValues.sensorId)"
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

