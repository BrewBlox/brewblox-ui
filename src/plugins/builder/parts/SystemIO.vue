<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { RIGHT } from '../getters';

@Component
export default class SystemIO extends PartBase {
  readonly paths = {
    borders: [
      'M30,21 H50',
      'M30,29 H50',
    ],
    liquid: 'M30,25 H50',
  };

  get flowSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get liquids() {
    return this.liquidOnCoord(RIGHT);
  }

  get arrowTransform() {
    if (this.flowSpeed < 0) {
      return 'rotate(180)';
    }
    return '';
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <g v-if="flowSpeed > 0">
        <polyline points="1.25,17.5 8.75,25 1.25,32.5" />
        <polyline points="9.13,19.25 14.88,25 9.13,30.75" />
        <polyline points="17,21 21,25 17,29" />
      </g>
      <g v-else-if="flowSpeed < 0" transform="rotate(180, 25, 25)">
        <polyline points="40.5,17.5 48,25 40.5,32.5" />
        <polyline points="36.4,19.3 42.1,25 36.4,30.8" />
        <polyline points="32.3,21 36.3,25 32.3,29" />
      </g>
      <g v-else>
        <polyline points="8.75,17.5 8.75,32.5" />
        <polyline points="14.88,19.25 14.88,30.75" />
        <polyline points="21,21 21,29" />
      </g>
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :num-arrows="1" :speed="flowSpeed" path="M25,25H50" />
  </g>
</template>
