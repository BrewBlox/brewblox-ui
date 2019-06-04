<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Unit } from '@/helpers/units';
import BlockForm from '@/plugins/spark/components/BlockForm';

@Component
export default class TempSensorOneWireForm extends BlockForm {
  defaultData() {
    return {
      value: new Unit(null, 'degC'),
      offset: new Unit(0, 'delta_degC'),
      address: '',
    };
  }

  presets() {
    return [];
  }
}
</script>

<template>
  <q-card dark class="widget-modal">
    <WidgetFormToolbar v-if="!embedded" v-bind="$props"/>
    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Address</q-item-label>
            <InputPopupEdit
              :field="block.data.address"
              :change="callAndSaveBlock(v => block.data.address = v)"
              label="Address"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Offset</q-item-label>
            <UnitPopupEdit
              :field="block.data.offset"
              :change="callAndSaveBlock(v => block.data.offset = v)"
              label="Offset"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
