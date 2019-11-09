<script lang="ts">
import { Component } from 'vue-property-decorator';

import { blockTypes } from '@/plugins/spark/block-types';
import BlockWidgetBase from '@/plugins/spark/components/BlockWidgetBase';

import { sparkStore } from '../../store';
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
export default class MotorValveWidget extends BlockWidgetBase {
  readonly block!: MotorValveBlock;

  get pins(): Spark3PinsBlock | null {
    const block = sparkStore.blockValues(this.serviceId)
      .find(block => block.type === blockTypes.Spark3Pins);
    return block ? block as Spark3PinsBlock : null;
  }

  get disabled12V(): boolean {
    return !!this.pins && !this.pins.data.enableIoSupply12V;
  }

  enable12V(): void {
    if (this.pins) {
      this.pins.data.enableIoSupply12V = true;
      sparkStore.saveBlock([this.serviceId, this.pins]);
    }
  }
}
</script>

<template>
  <GraphCardWrapper :show="inDialog">
    <template #graph>
      <HistoryGraph :graph-id="widget.id" :config="graphCfg" />
    </template>

    <component :is="mode" :crud="crud" :class="cardClass">
      <template #toolbar>
        <component :is="toolbarComponent" :crud="crud" :mode.sync="mode" />
      </template>

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
