<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { state } from './getters';
import { DS2413Block } from './state';

@Component
export default class DS2413Form extends BlockForm {
  get block(): DS2413Block {
    return this.blockField as DS2413Block;
  }

  get address() {
    return this.block.data.address;
  }

  get actuatorState() {
    return state[this.block.data.state];
  }

  get boolState() {
    return this.actuatorState === 'Active';
  }

  presets() {
    return [
      {
        label: 'Default',
        value: {
          address: '',
          state: 2,
        },
      },
    ];
  }
}
</script>

<template>
  <div class="widget-modal">
    <q-btn
      rounded
      v-close-overlay
      v-if="$props.buttons"
      label="close"
      icon="close"
      style="position: absolute; right: 18px; top: 18px"
    />
    <q-card>
      <q-card-title>State</q-card-title>
      <q-card-main>
        <q-field class="col" label="Address">
          <span>{{ address }}</span>
        </q-field>
        <q-field class="col" label="State">
          <big>{{ actuatorState }}</big>
        </q-field>
      </q-card-main>
    </q-card>
    <q-card>
      <q-card-title>Block Settings</q-card-title>
      <q-card-main>
        <q-field class="col" label="Block ID">
          <InputPopupEdit label="Block ID" :field="block.id" :change="changeBlockId"/>
        </q-field>
        <q-field class="col" label="Service ID">
          <big>{{ serviceId }}</big>
        </q-field>
        <q-field class="col" label="Block Type">
          <big>{{ block.type }}</big>
        </q-field>
        <q-field class="col" label="Preset">
          <SelectPopupEdit
            label="Preset"
            :field="block.data"
            :options="presets()"
            :change="callAndSaveBlock(v => block.data = v)"
          />
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

