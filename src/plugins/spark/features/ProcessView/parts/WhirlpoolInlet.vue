<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartComponent from '../components/PartComponent';
import { LEFT } from '../getters';

@Component
export default class WhirlpoolInlet extends PartComponent {
  get paths() {
    return {
      borders: [
        'M0,21h20c5,0,9,4,9,9v144.1c0,0,0.1,4.9-4,4.9c-4.3,0-4-4.9-4-4.9V32c0-1.7-1.3-3-3-3H0',
        'M25,178.5L25,178.5c-1.1,0-2-0.9-2-2v-12c0-1.1,0.9-2,2-2l0,0c1.1,0,2,0.9,2,2v12C27,177.6,26.1,178.5,25,178.5z',
      ],
      liquid: 'M0,25H20a5,5,0,0,1,5,5V175',
    };
  }

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
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids"/>
    <g class="outline">
      <rect y="12" width="8" height="8" fill="white"/>
      <rect y="30" width="8" height="8" fill="white"/>
      <path v-for="border in paths.borders" :key="border" :d="border"/>
    </g>
    <AnimatedArrows :speed="flowSpeed" :path="paths.liquid" :num-arrows="8"/>
  </g>
</template>
