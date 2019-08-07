<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { LEFT } from '../getters';

@Component
export default class StraightInletTube extends PartBase {
  readonly paths = {
    borders: [
      'M 0,21 L 25,21',
      'M 0,29 L 25,29',
    ],
    liquid: 'M0,25 H25',
  };

  get flowSpeed() {
    return -this.flowOnCoord(LEFT);
  }

  get liquids() {
    return this.liquidOnCoord(LEFT);
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <polyline points="40.5,17.5 48,25 40.5,32.5" />
      <polyline points="36.4,19.3 42.1,25 36.4,30.8" />
      <polyline points="32.3,21 36.3,25 32.3,29" />
      <rect fill="white" y="12.5" width="8" height="8" />
      <rect fill="white" y="30" width="8" height="8" />
      <path v-for="border in paths.borders" :key="border" :d="border" />
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids" />
    <AnimatedArrows :num-arrows="1" :speed="flowSpeed" :path="paths.liquid" />
  </g>
</template>
