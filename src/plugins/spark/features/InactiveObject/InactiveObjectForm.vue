<script lang="ts">
import Component from 'vue-class-component';

import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class InactiveObjectForm extends BlockForm {
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
