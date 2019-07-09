<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartComponent from '../components/PartComponent';
import { RIGHT } from '../getters';

@Component
export default class ElbowTube extends PartComponent {
  get paths() {
    return {
      borders: [
        'M21,0v20c0,5,4,9,9,9h20',
        'M29,0v18c0,1.7,1.3,3,3,3h18',
      ],
      liquid: 'M25,0V20a5,5,0,0,0,5,5H50',
    };
  }

  get flowSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get liquids() {
    return this.liquidOnCoord(RIGHT);
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <path :d="paths.borders[0]"/>
      <path :d="paths.borders[1]"/>
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids"/>
    <AnimatedArrows :speed="flowSpeed" :path="'M25,0V16a9,9,0,0,0,9,9H50'"/>
  </g>
</template>
