<script lang="ts">
import { computed, defineComponent } from 'vue';

import { LEFT } from '@/plugins/builder/const';

@Component
export default class StraightInletTube extends PartBase {
  readonly paths = {
    borders: [
      'M 0,21 L 25,21',
      'M 0,29 L 25,29',
    ],
    liquid: 'M0,25 H25',
  };

  get flowSpeed(): number {
    return -this.flowOnCoord(LEFT);
  }

  get liquids(): string[] {
    return this.liquidOnCoord(LEFT);
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <rect fill="white" y="12.5" width="8" height="8" />
      <rect fill="white" y="30" width="8" height="8" />
      <path v-for="border in paths.borders" :key="border" :d="border" />
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :num-arrows="1" :speed="flowSpeed" :path="paths.liquid" />
  </g>
</template>
