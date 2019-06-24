<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireForm extends BlockCrudComponent {
  readonly block!: TempSensorOneWireBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar :title="widget.title"/>
    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Address</q-item-label>
            <InputField
              :value="block.data.address"
              title="Address"
              tag="big"
              @input="v => { block.data.address = v; saveBlock(); }"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label caption>Offset</q-item-label>
            <UnitField
              :value="block.data.offset"
              title="Offset"
              tag="big"
              @input="v => { block.data.offset = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
