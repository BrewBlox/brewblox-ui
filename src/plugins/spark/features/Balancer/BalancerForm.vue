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
}
</script>

<template>
  <div class="widget-modal column">
    <q-toolbar v-if="!$props.embedded" class="unpadded">
      <q-toolbar-title>{{ widgetId }} settings</q-toolbar-title>
      <q-btn v-close-overlay flat rounded label="close"/>
    </q-toolbar>
    <q-collapsible group="modal" class="col-12" icon="view_compact" label="Widget Settings">
      <WidgetSettings v-bind="$props"/>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="$props" :presets-data="presets()"/>
    </q-collapsible>
  </div>
</template>
