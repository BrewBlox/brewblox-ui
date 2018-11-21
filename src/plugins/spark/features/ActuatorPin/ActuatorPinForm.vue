<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { state } from './getters';
import { ActuatorPinBlock } from './state';

@Component
export default class ActuatorPinForm extends BlockForm {
  get block(): ActuatorPinBlock {
    return this.blockField as ActuatorPinBlock;
  }

  get actuatorState() {
    return state[this.block.data.state];
  }

  defaultData() {
    return {
      state: 2,
      invert: false,
      constrainedBy: { constraints: [] },
    };
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="State">
          <big>{{ actuatorState }}</big>
        </q-field>
        <q-field class="col" label="Inverted">
          <q-toggle :value="block.data.invert" @input="v => { block.data.invert = v; saveBlock(); }" />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <q-field class="col" label="Constraints" orientation="vertical">
          <DigitalConstraints :serviceId="serviceId" :field="block.data.constrainedBy" :change="callAndSaveBlock(v => block.data.constrainedBy = v)" />
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

