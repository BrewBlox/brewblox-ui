<script lang="ts">
import { computed, defineComponent } from 'vue';

import { RIGHT } from '@/plugins/builder/const';
import { elbow } from '@/plugins/builder/utils';

@Component
export default class ElbowTube extends PartBase {
  readonly paths = {
    borders: [
      `M21,0 v17 ${elbow(12, 12, false)} H50`,
      `M29,0 v17 ${elbow(4, 4, false)} H50`,
    ],
    liquid: `M25,0 v17 ${elbow(8, 8, false)} H50`,
  };

  get flowSpeed(): number {
    return this.flowOnCoord(RIGHT);
  }

  get liquids(): string[] {
    return this.liquidOnCoord(RIGHT);
  }
}
</script>

<template>
  <g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :speed="flowSpeed" :path="paths.liquid" />
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
  </g>
</template>
