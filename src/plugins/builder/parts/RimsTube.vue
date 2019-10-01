<script lang="ts">
import { Component } from 'vue-property-decorator';

import { Coordinates } from '@/helpers/coordinates';

import PartBase from '../components/PartBase';
import { elbow } from '../helpers';

@Component
export default class RimsTube extends PartBase {
  get paths(): Mapped<string> {
    const startLast = this.squares(this.sizeX - 1);
    return {
      entry: `M71,0 v10 M79,0 v10 M${startLast + 21},0 v10 M${startLast + 29},0 v10`,
      content: `M50,25 H${startLast + 48}`,
      casing: `M50,10 H71 M79,10 H${startLast + 21} M${startLast + 29},10 ` +
        `H${startLast + 50 - 4 - 2} ${elbow(4, 4, true)} V36 ${elbow(-4, 4, false)} H50`,
      element: `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 H${startLast + 25} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`,
      flowPath: `M75,0 v17 ${elbow(8, 8, false)}` +
        `H${startLast + 17} ${elbow(8, -8, true)} V0`,
    };
  }

  get outCoord(): string {
    return new Coordinates([this.sizeX - 0.5, 0, 0]).toString();
  }

  get flowSpeed(): number {
    return this.flowOnCoord(this.outCoord);
  }

  get liquids(): string[] {
    return this.liquidOnCoord(this.outCoord);
  }
}
</script>

<template>
  <g>
    <PwmValues :part="part" settings-key="pwm" />
    <LiquidStroke :paths="[paths.content]" :colors="liquids" class="contentLiquid" />
    <LiquidStroke :paths="[paths.flowPath]" :colors="liquids" />
    <AnimatedArrows :num-arrows="(sizeX-1)*2" :speed="flowSpeed" :path="paths.flowPath" />
    <g class="outline">
      <path :d="paths.entry" />
      <path :d="paths.casing" />
      <path :d="paths.element" />
    </g>
  </g>
</template>

<style lang="stylus" scoped>
/deep/ .contentLiquid path {
  stroke-width: 30 !important;
  stroke-linecap: butt;
  fill: none;
}
</style>
