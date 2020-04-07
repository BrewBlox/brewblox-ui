<script lang="ts">
import { Component } from 'vue-property-decorator';

import { blockTypes } from '@/plugins/spark/block-types';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { Spark3PinsBlock } from '../Spark3Pins/types';
import MotorValveBasic from './MotorValveBasic.vue';
import MotorValveFull from './MotorValveFull.vue';
import { MotorValveBlock } from './types';

@Component({
  components: {
    Basic: MotorValveBasic,
    Full: MotorValveFull,
  },
})
export default class MotorValveWidget
  extends BlockWidgetBase<MotorValveBlock> {

  get pins(): Spark3PinsBlock | null {
    return this.sparkModule
      .blocks
      .find(block => block.type === blockTypes.Spark3Pins)
      ?? null;
  }

  get disabled12V(): boolean {
    return !!this.pins && !this.pins.data.enableIoSupply12V;
  }

  enable12V(): void {
    if (this.pins) {
      this.pins.data.enableIoSupply12V = true;
      this.sparkModule.saveBlock(this.pins);
    }
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
