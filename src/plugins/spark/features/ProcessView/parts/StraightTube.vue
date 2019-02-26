<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { RIGHT } from '../getters';

@Component
export default class StraightTube extends PartComponent {
  get paths() {
    return {
      borders: [
        'M 0,21 H 50',
        'M 0,29 H 50',
      ],
      liquid: 'M 0,25 H 50',
    };
  }

  get flowSpeed() {
    return this.flow[RIGHT];
  }
}
</script>

<template>
  <g class="straight-tube">
    <g class="outline">
      <path :d="paths.borders[0]"/>
      <path :d="paths.borders[1]"/>
    </g>
    <LiquidStroke v-if="hasLiquid" :paths="[paths.liquid]" :colors="liquidColor"/>
    <AnimatedArrows v-if="flowSpeed && hasLiquid" :speed="flowSpeed" path="M0,25H50"/>
  </g>
</template>


