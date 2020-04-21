<script lang="ts">
import { Component } from 'vue-property-decorator';

import { createDialog } from '@/helpers/dialog';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import TempSensorSwapDialog from './TempSensorSwapDialog.vue';
import { TempSensorOneWireBlock } from './types';

@Component({
  components: {
    TempSensorSwapDialog,
  },
})
export default class TempSensorOneWireWidget
  extends BlockWidgetBase<TempSensorOneWireBlock> {

  get hasValue(): boolean {
    return this.block.data.value.value !== null;
  }

  startSwap(): void {
    createDialog({
      component: TempSensorSwapDialog,
      serviceId: this.serviceId,
      leftId: this.blockId,
    });
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog" v-bind="{context}">
    <template #graph>
      <HistoryGraph
        :graph-id="widget.id"
        :config="graphCfg"
        :refresh-trigger="mode"
        use-range
        use-presets
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode">
        <template #actions>
          <ActionItem icon="mdi-swap-horizontal" label="Swap OneWire address" @click="startSwap" />
        </template>
      </component>
    </template>

    <div>
      <CardWarning v-if="!hasValue">
        <template #message>
          OneWire Sensor could not be read.
        </template>
      </CardWarning>

      <div class="q-ma-md row justify-center">
        <div v-if="hasValue" class="col-auto row items-center">
          <q-icon
            name="mdi-thermometer"
            size="md"
            color="green-3"
            class="col-auto"
          />
          <UnitField
            :value="block.data.value"
            readonly
            tag="big"
            class="col-auto"
          />
        </div>
      </div>

      <template v-if="mode === 'Full'">
        <q-separator inset />

        <div class="widget-body row">
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
        </div>
      </template>
    </div>
  </GraphCardWrapper>
</template>
