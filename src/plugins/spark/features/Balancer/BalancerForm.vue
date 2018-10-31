<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { ActuatorAnalogLink } from '@/helpers/units/KnownLinks';
import { BalancedActuator } from './state';

@Component
export default class BalancerForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      clients: { path: 'data.clients', default: [] },
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
        v-for="(client, idx) in inputValues.clients"
        :key="idx"
        label="Client requested / granted"
      >
        <big
          v-for="(client, idx) in inputValues.clients"
          :key="idx"
        >
          {{ client.id }}: {{ client.granted }} / {{ client.requested }}
        </big>
      </widget-field>

    </q-card-main>
  </q-card>
</template>

<style scoped>
</style>

