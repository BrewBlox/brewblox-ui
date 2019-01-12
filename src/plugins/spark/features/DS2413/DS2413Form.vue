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
  <div class="widget-modal column">
    <q-toolbar v-if="$props.buttons" class="unpadded">
      <q-toolbar-title>{{ block.id }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="settings" label="Settings">
      <q-field class="col" label="Address">
        <span>{{ address }}</span>
      </q-field>
      <q-field class="col" label="State">
        <big>{{ actuatorState }}</big>
      </q-field>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
