<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class MutexForm extends BlockForm {
  get inputMapping() {
    return {
      profiles: { path: 'profiles', default: [] },
      differentActuatorWait: { path: 'data.differentActuatorWait', default: 0 },
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
        label="Actuator wait"
        icon="edit"
      >
        <q-input
          v-model="inputValues.differentActuatorWait"
          type="number"
        />
      </widget-field>

    </q-card-main>
  </q-card>
</template>

<style scoped>
</style>

