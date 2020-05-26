<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { DigitalActuatorBlock, MotorValveBlock } from '@/plugins/spark/types';
import { DigitalState } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { UP } from '../getters';
import { elbow, settingsBlock } from '../helpers';

@Component
export default class LValve extends PartBase {
  readonly paths = {
    bigEnclosure: `
      M21,0 V17 ${elbow(12, 12, false)} H50
      L39.5,29 c-1.4,5.1,-5.4,9.1,-10.5,10.5
      L21,39.5 c-5.1,-1.4,-9.1,-5.4,-10.5,-10.5
      L10.5,21 c1.4,-5.1,5.4,-9.1,10.5,-10.5`,
    smallEnclosure: `
      M29,0 V17 ${elbow(4, 4, false)} H50
      L39.5 21c-1.4-5.1-5.4-9.1-10.5-10.5`,
    liquidLeft: `M25,0 v17 ${elbow(-8, 8, false)} H0`,
    liquidRight: `M25,0 v17 ${elbow(8, 8, false)} H50`,
  };

  get block(): DigitalActuatorBlock | MotorValveBlock | null {
    return settingsBlock(this.part, 'valve');
  }

  get closed(): boolean {
    return this.block !== null
      ? Boolean(this.block.data.state === DigitalState.Active)
      : Boolean(this.settings.closed);
  }

  get liquidPath(): string {
    return this.closed
      ? this.paths.liquidLeft
      : this.paths.liquidRight;
  }

  get liquidSpeed(): number {
    return -this.flowOnCoord(UP); // reversed
  }

  get liquidColor(): string[] {
    return this.liquidOnCoord(UP);
  }

  @Watch('block')
  triggerUpdate(block, prevBlock): void {
    if (block === null
      || prevBlock === null
      || block.data.state !== prevBlock.data.state) {
      this.invalidateFlows();
    }
  }
}
</script>

<template>
  <g>
    <LiquidStroke :paths="[liquidPath]" :colors="liquidColor" />
    <g class="outline">
      <AnimatedArrows :path="liquidPath" :speed="liquidSpeed" />
    </g>
    <g class="outline fill" :transform="closed ? `translate(${squares(sizeX)}, 0) scale(-1, 1)` : ''">
      <path d="M0,21 H10" />
      <path d="M0,29 H10" />
      <path :d="paths.bigEnclosure" />
      <path :d="paths.smallEnclosure" />
    </g>
    <PowerIcon v-if="block" :transform="`translate(${closed ? 5 : -5}, 15)`" color="black" />
  </g>
</template>
