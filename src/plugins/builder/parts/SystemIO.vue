<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { RIGHT } from '../getters';
import { horizontalChevrons } from '../helpers';

const chevrons = horizontalChevrons(15, 25);
const paths = {
  borders: [
    'M30,21 H50',
    'M30,29 H50',
  ],
  liquid: 'M30,25 H50',
  arrows: 'M25,25 H50',
};

@Component
export default class SystemIO extends PartBase {
  readonly chevrons = chevrons;
  readonly paths = paths;

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
        <polyline v-for="line in chevrons.right" :key="line" :points="line" />
      </g>
      <g v-else-if="flowSpeed < 0">
        <polyline v-for="line in chevrons.left" :key="line" :points="line" />
      </g>
      <g v-else>
        <polyline v-for="line in chevrons.straight" :key="line" :points="line" />
      </g>
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :num-arrows="1" :speed="flowSpeed" :path="paths.arrows" />
  </g>
</template>
