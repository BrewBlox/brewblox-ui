<script lang="ts">
import { computed, defineComponent } from 'vue';

import { DOWN, LEFT, RIGHT, UP } from '@/plugins/builder/const';

@Component
export default class CrossTube extends PartBase {
  readonly paths = {
    up: 'M25,25 V0',
    down: 'M25,25 V50',
    left: 'M25,25 H0',
    right: 'M25,25 H50',
  };

  get speed(): Mapped<number> {
    return {
      up: this.flowOnCoord(UP),
      down: this.flowOnCoord(DOWN),
      left: this.flowOnCoord(LEFT),
      right: this.flowOnCoord(RIGHT),
    };
  }

  get liquids(): Mapped<string[]> {
    return {
      up: this.liquidOnCoord(UP),
      down: this.liquidOnCoord(DOWN),
      left: this.liquidOnCoord(LEFT),
      right: this.liquidOnCoord(RIGHT),
    };
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <polyline points="50,21 29,21 29,0" />
      <polyline points="21,0 21,21 0,21" />
      <polyline points="0,29 21,29 21,50" />
      <polyline points="29,50 29,29 50,29" />
    </g>
    <LiquidStroke :paths="[paths.up]" :colors="liquids.up" />
    <LiquidStroke :paths="[paths.down]" :colors="liquids.down" />
    <LiquidStroke :paths="[paths.left]" :colors="liquids.left" />
    <LiquidStroke :paths="[paths.right]" :colors="liquids.right" />
    <g class="outline">
      <AnimatedArrows :path="paths.up" :num-arrows="1" :speed="speed.up" />
      <AnimatedArrows :path="paths.down" :num-arrows="1" :speed="speed.down" />
      <AnimatedArrows :path="paths.left" :num-arrows="1" :speed="speed.left" />
      <AnimatedArrows :path="paths.right" :num-arrows="1" :speed="speed.right" />
    </g>
  </g>
</template>
