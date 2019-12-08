<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireWidget
  extends BlockWidgetBase<TempSensorOneWireBlock> {

  get cardStyle(): Mapped<string> {
    return this.inDialog
      ? { minHeight: '40vh' }
      : {};
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <q-card :class="cardClass" :style="cardStyle">
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />

      <q-card-section>
        <CardWarning v-if="block.data.value.val === null">
          <template #message>
            OneWire Sensor could not be read.
          </template>
        </CardWarning>
        <UnitField v-else :value="block.data.value" label="Value" readonly item-aligned tag="big" />


        <template v-if="mode === 'Full'">
          <q-item>
            <q-item-section>
              <UnitField
                :value="block.data.offset"
                title="Offset"
                label="Offset"
                @input="v => { block.data.offset = v; saveBlock(); }"
              />
            </q-item-section>
            <q-item-section>
              <InputField
                :value="block.data.address"
                title="Address"
                label="Address"
                @input="v => { block.data.address = v; saveBlock(); }"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-card-section>
    </q-card>
  </GraphCardWrapper>
</template>
