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
  <div class="widget-modal column">
    <BlockWidgetSettings v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-collapsible opened group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
