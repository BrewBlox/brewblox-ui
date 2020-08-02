<script lang="ts">
import { Component } from 'vue-property-decorator';

import { typeMatchFilter } from '@/helpers/functional';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';
import { BlockType, MotorValveBlock, Spark3PinsBlock } from '@/plugins/spark/types';

import MotorValveBasic from './MotorValveBasic.vue';
import MotorValveFull from './MotorValveFull.vue';

@Component({
  components: {
    Basic: MotorValveBasic,
    Full: MotorValveFull,
  },
})
export default class MotorValveWidget
  extends BlockWidgetBase<MotorValveBlock> {

  // Spark 2 pins have no support for toggling 12V
  get spark3Pins(): Spark3PinsBlock | null {
    return this.sparkModule
      .blocks
      .find(typeMatchFilter<Spark3PinsBlock>(BlockType.Spark3Pins))
      ?? null;
  }

  get disabled12V(): boolean {
    return this.spark3Pins !== null
      && !this.spark3Pins.data.enableIoSupply12V;
  }

  enable12V(): void {
    if (this.spark3Pins) {
      this.spark3Pins.data.enableIoSupply12V = true;
      this.sparkModule.saveBlock(this.spark3Pins);
    }
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
        use-presets
        use-range
        @params="saveGraphParams"
        @layout="saveGraphLayout"
      />
    </template>

    <template #toolbar>
      <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
    </template>

    <component :is="mode" :crud="crud">
      <template #warnings>
        <CardWarning v-if="disabled12V">
          <template #message>
            <span>12V is disabled.</span>
          </template>
          <template #actions>
            <q-btn text-color="white" flat label="Enable 12V" @click="enable12V" />
          </template>
        </CardWarning>
        <CardWarning v-else-if="!block.data.hwDevice.id || !block.data.startChannel">
          <template #message>
            <span>This Motor Valve has no channel selected.</span>
          </template>
        </CardWarning>
      </template>
    </component>
  </GraphCardWrapper>
</template>
