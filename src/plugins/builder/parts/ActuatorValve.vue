<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';

import { Block, DigitalState } from '@/plugins/spark/types';

import PartBase from '../components/PartBase';
import { RIGHT } from '../getters';
import { settingsBlock } from '../helpers';

@Component
export default class ActuatorValve extends PartBase {
  get paths() {
    return {
      outerValve: [
        'M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50',
        'M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50',
      ],
      innerValve: [
        'M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z',
        'M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z',
      ],
      powerIcon: `
        M27.7,9.5c-0.7,1.1-1.4,2.2-2.3,3.2c-0.4,0.5-0.8,1-1.2,1.5
        s-0.9,1-1.3,1.4L22.3,14c1.8-0.1,3.6-0.1,5.5,0l2.4,0.1l-1.7,1.5
        c-0.5,0.4-1,0.9-1.4,1.3s-1,0.8-1.5,1.2c-1,0.8-2.1,1.6-3.2,2.3
        c0.7-1.1,1.5-2.2,2.3-3.2c0.4-0.5,0.8-1,1.2-1.5
        c0.4-0.5,0.9-1,1.3-1.4l0.7,1.6c-1.8,0.1-3.6,0.1-5.5,0l-2.3-0.1
        l1.7-1.5c0.5-0.4,1-0.9,1.5-1.3c0.5-0.4,1-0.8,1.5-1.3
        C25.6,10.9,26.6,10.2,27.7,9.5z`,
      openLiquid: [
        'm0,25h50',
      ],
      closedLiquid: [
        'm0,25h19',
        'm31,25h50',
      ],
      arrows: 'M0,25H50',
    };
  }

  get valveBlock(): Block | null {
    return settingsBlock(this.part, 'valve');
  }

  get flowSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get liquids() {
    return this.liquidOnCoord(RIGHT);
  }

  get closed() {
    return !this.valveBlock || this.valveBlock.data.state !== DigitalState.Active;
  }

  get valveRotation() {
    if (this.valveBlock) {
      switch (this.valveBlock.data.state) {
        case DigitalState.Inactive:
          return 90;
        case DigitalState.Active:
          return 0;
        default:
          return 45;
      }
    }
    return 90;
  }

  @Watch('valveBlock')
  triggerUpdate(block, prevBlock) {
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
    <foreignObject v-if="!valveBlock" :height="squares(1)" :width="squares(1)">
      <q-icon name="mdi-link-variant-off" size="sm" class="absolute-right" style="height: 15px;" />
    </foreignObject>
    <g key="valve-outer" class="outline">
      <path :d="paths.outerValve[0]" />
      <path :d="paths.outerValve[1]" />
    </g>
    <LiquidStroke v-if="closed" :paths="paths.closedLiquid" :colors="liquids" />
    <LiquidStroke v-else :paths="paths.openLiquid" :colors="liquids" />
    <g key="valve-inner" :transform="`rotate(${valveRotation}, 25, 25)`" class="fill outline inner">
      <path :d="paths.innerValve[0]" />
      <path :d="paths.innerValve[1]" />
      <g class="power-icon">
        <path :d="paths.powerIcon" />
      </g>
    </g>
    <AnimatedArrows key="valve-arrows" :speed="flowSpeed" :path="paths.arrows" />
  </g>
</template>

<style lang="stylus" scoped>
/deep/ .power-icon path {
  stroke-width: 1px;
  stroke: black;
  fill: black;
}
</style>
