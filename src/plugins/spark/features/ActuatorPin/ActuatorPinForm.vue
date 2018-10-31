<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { state } from './getters';

@Component
export default class ActuatorPinForm extends BlockForm {
  get inputMapping() {
    return {
      state: { path: 'data.state', default: 2 },
      invert: { path: 'data.invert', default: false },
      constrainedBy: { path: 'data.constrainedBy', default: { constraints: [] } },
    };
  }

  get stateOptions() {
    return state.map((s, idx) => ({ label: s, value: idx }));
  }
}
</script>

<template>
  <q-card orientation="vertical">
    <q-card-main class="column centered">

      <widget-field
        label="State"
        icon="edit"
      >
        <q-select
          v-model="inputValues.state"
          :options="stateOptions"
        />
      </widget-field>

      <widget-field
        label="Invert"
        icon="edit"
      >
        <q-toggle
          v-model="inputValues.invert"
        />
      </widget-field>

      <widget-field
        label="Constrained by"
        icon="edit"
      >
        <DigitalConstraints
          :serviceId="block.serviceId"
          v-model="inputValues.constrainedBy"
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

