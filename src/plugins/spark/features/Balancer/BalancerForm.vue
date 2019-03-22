<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class BalancerForm extends BlockForm {
  defaultData() {
    return {
      clients: [],
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
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-expansion-item class="text-h6" opened group="modal" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-expansion-item>
  </q-card>
</template>
