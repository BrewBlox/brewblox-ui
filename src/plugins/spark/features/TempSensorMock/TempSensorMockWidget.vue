<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidget from '@/plugins/spark/components/BlockWidget';

import { TempSensorMockBlock } from './types';

@Component
export default class TempSensorMockWidget extends BlockWidget {
  readonly block!: TempSensorMockBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />

    <q-card-section>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Value
          </q-item-label>
          <UnitField
            :value="block.data.value"
            :readonly="!block.data.connected"
            title="Value"
            tag="big"
            @input="v => { block.data.value = v; saveBlock(); }"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label caption>
            Connected
          </q-item-label>
          <q-toggle
            :value="block.data.connected"
            @input="v => { block.data.connected = v; saveBlock(); }"
          />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>

