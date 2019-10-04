<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireWidget extends BlockWidgetBase {
  readonly block!: TempSensorOneWireBlock;

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
      <HistoryGraph :id="widget.id" :config="graphCfg" />
    </template>

    <q-card dark :class="cardClass" :style="cardStyle">
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />

      <q-card-section>
        <CardWarning v-if="block.data.value.val === null">
          <template #message>
            OneWire Sensor could not be read.
          </template>
        </CardWarning>
        <q-item v-else>
          <q-item-section>
            <q-item-label caption>
              Value
            </q-item-label>
            <UnitField :value="block.data.value" readonly tag="big" />
          </q-item-section>
        </q-item>

        <template v-if="mode === 'Full'">
          <q-item dark>
            <q-item-section class="col-grow">
              <q-item-label caption>
                Address
              </q-item-label>
              <InputField
                :value="block.data.address"
                title="Address"
                tag="big"
                @input="v => { block.data.address = v; saveBlock(); }"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                Offset
              </q-item-label>
              <UnitField
                :value="block.data.offset"
                title="Offset"
                tag="big"
                @input="v => { block.data.offset = v; saveBlock(); }"
              />
            </q-item-section>
          </q-item>
        </template>
      </q-card-section>
    </q-card>
  </GraphCardWrapper>
</template>
