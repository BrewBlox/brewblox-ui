<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireWidget extends BlockWidgetBase {
  readonly block!: TempSensorOneWireBlock;
}
</script>

<template>
  <q-card dark class="text-white scroll">
    <BlockWidgetToolbar :crud="crud" />
    <CardWarning v-if="block.data.value.val === null">
      <template #message>
        OneWire Sensor could not be read.
      </template>
    </CardWarning>
    <q-card-section v-else>
      <q-item dark>
        <q-item-section>
          <q-item-label caption>
            Value
          </q-item-label>
          <UnitField :value="block.data.value" readonly tag="big" />
        </q-item-section>
      </q-item>
    </q-card-section>
  </q-card>
</template>
