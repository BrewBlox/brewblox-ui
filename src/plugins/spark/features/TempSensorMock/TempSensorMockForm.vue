<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockCrudComponent from '@/plugins/spark/components/BlockCrudComponent';

import { TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockForm extends BlockCrudComponent {
  readonly block!: TempSensorMockBlock;
}
</script>

<template>
  <q-card dark class="widget-modal">
    <FormToolbar :title="widget.title"/>

    <q-card-section>
      <q-expansion-item default-opened group="modal" icon="settings" label="Settings">
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Value</q-item-label>
            <UnitField
              :value="block.data.value"
              :readonly="!block.data.connected"
              title="Value"
              tag="big"
              @input="v => { block.data.value = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
        <q-item dark>
          <q-item-section>
            <q-item-label caption>Connected</q-item-label>
            <q-toggle
              :value="block.data.connected"
              @input="v => { block.data.connected = v; saveBlock(); }"
            />
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-card-section>
  </q-card>
</template>
