<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';
import { DS2413Block } from './state';

@Component
export default class DS2413Form extends BlockForm {
  get block(): DS2413Block {
    return this.blockField as DS2413Block;
  }

  defaultData() {
    return {
      address: '',
      state: 2,
    };
  }

  presets() {
    return [];
  }

  created() {
    this.block; // ensure getter is evaluated
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-expansion-item default-opened group="modal" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-expansion-item>
  </q-card>
</template>
