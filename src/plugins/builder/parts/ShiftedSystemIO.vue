<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { CENTER } from '../getters';
import { verticalChevrons } from '../helpers';

const chevrons = verticalChevrons(50, 86.4);
const paths = {
  borders: [
    'M21,0v20c0,5,4,9,9,9 h13 c1.7,0 1.3,3 3,3 V75 ',
    'M29,0v18c0,1.7,1.3,3,3,3 h13 c5,0 9,4 9,9 V75',
  ],
  liquid: 'M25,0V20a5,5,0,0,0,5,5 h14.5 a5,5,0,0,1,5,6 V75',
  arrows: 'M25,0V20a5,5,0,0,0,5,5 h14.5 a5,5,0,0,1,5,6 V80',
};

@Component
export default class ShiftedSystemIO extends PartBase {
  readonly chevrons = chevrons;
  readonly paths = paths;

  get flowSpeed(): number {
    return this.flowOnCoord(CENTER);
  }

  get liquids(): string[] {
    return this.liquidOnCoord(CENTER);
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <path :d="paths.borders[0]" />
      <path :d="paths.borders[1]" />
      <g v-if="flowSpeed > 0">
        <polyline v-for="line in chevrons.down" :key="line" :points="line" />
      </g>
      <g v-else-if="flowSpeed < 0">
        <polyline v-for="line in chevrons.up" :key="line" :points="line" />
      </g>
      <g v-else>
        <polyline v-for="line in chevrons.straight" :key="line" :points="line" />
      </g>
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :speed="flowSpeed" :path="paths.arrows" />
  </g>
</template>
