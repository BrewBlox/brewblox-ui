<script lang="ts">
import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';
import Component from 'vue-class-component';

@Component
export default class TempSensorMockForm extends BlockForm {
  defaultData() {
    return {
      value: new Unit(20, 'degC'),
      connected: true,
    };
  }

  presets() {
    return [];
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <BlockFormToolbar v-if="!$props.embedded" v-bind="$props" :block="block"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>Value</q-item-section>
          <q-item-section>
            <UnitPopupEdit
              :field="block.data.value"
              :disabled="!block.data.connected"
              :change="callAndSaveBlock(v => block.data.value = v)"
              label="Value"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>Connected</q-item-section>
          <q-item-section>
            <q-toggle
              :value="block.data.connected"
              @input="v => { block.data.connected = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>

      <q-expansion-item group="modal" icon="mdi-cube" label="Block Settings">
        <BlockSettings v-bind="$props" :presets-data="presets()"/>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
