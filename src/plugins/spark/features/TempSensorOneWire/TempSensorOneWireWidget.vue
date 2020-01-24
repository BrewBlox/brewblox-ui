<script lang="ts">
import { Component } from 'vue-property-decorator';

import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { TempSensorOneWireBlock } from './types';

@Component
export default class TempSensorOneWireWidget
  extends BlockWidgetBase<TempSensorOneWireBlock> {

  get hasValue(): boolean {
    return this.block.data.value.value !== null;
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" :refresh-trigger="mode" />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <div class="widget-md">
      <CardWarning v-if="!hasValue">
        <template #message>
          OneWire Sensor could not be read.
        </template>
      </CardWarning>

      <div class="widget-body row">
        <UnitField
          v-if="hasValue"
          :value="block.data.value"
          label="Value"
          readonly
          item-aligned
          tag="big"
          class="col-grow"
        />

        <template v-if="mode === 'Full'">
          <div class="col-break" />
          <UnitField
            :value="block.data.offset"
            title="Offset"
            label="Offset"
            class="col-grow"
            @input="v => { block.data.offset = v; saveBlock(); }"
          />
          <InputField
            :value="block.data.address"
            title="Address"
            label="Address"
            class="col-grow"
            @input="v => { block.data.address = v; saveBlock(); }"
          />
        </template>
      </div>
    </div>
  </GraphCardWrapper>
</template>
