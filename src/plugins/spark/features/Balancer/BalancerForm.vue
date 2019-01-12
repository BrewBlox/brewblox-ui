<script lang="ts">
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class BalancerForm extends BlockForm {
  presets() {
    return [
      {
        label: 'Default',
        value: {
          clients: [],
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
    <q-collapsible group="modal" class="col-12" icon="mdi-tune" label="Clients">
      <q-field
        v-for="client in block.data.clients"
        :key="client.id.id"
        :label="client.id.id || 'unknown'"
      >
        <big>{{ client.granted | round }} / {{ client.requested | round }}</big>
      </q-field>
    </q-collapsible>
    <q-collapsible group="modal" class="col-12" icon="mdi-cube" label="Block Settings">
      <BlockSettings v-bind="settingsProps" :presets-func="presets"/>
    </q-collapsible>
  </div>
</template>
