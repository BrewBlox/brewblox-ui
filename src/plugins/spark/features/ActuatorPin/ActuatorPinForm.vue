<script lang="ts">
import Component from 'vue-class-component';
import BlockForm from '@/plugins/spark/components/BlockForm';
import { state } from './getters';
import { ActuatorPinBlock } from './state';

@Component
export default class ActuatorPinForm extends BlockForm {
  get block(): ActuatorPinBlock {
    return this.$props.field as ActuatorPinBlock;
  }

  get actuatorState() {
    return state[this.block.data.state];
  }

  changeInvert(val: boolean) {
    this.block.data.invert = val;
    this.saveBlock();
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-card>
      <q-card-title>Settings</q-card-title>
      <q-card-main>
        <q-field
          class="col"
          label="State"
        >
          <big>{{ actuatorState }}</big>
        </q-field>
        <q-field
          class="col"
          label="Inverted"
        >
          <q-toggle
            :value="block.data.invert"
            @input="changeInvert"
          />
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Constraints</q-card-title>
      <q-card-main>
        <ReadonlyConstraints
          :serviceId="block.serviceId"
          :value="block.data.constrainedBy"
        />
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

