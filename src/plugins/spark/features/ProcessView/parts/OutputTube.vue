<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { clamp } from '@/helpers/functional';
import { AngledFlows } from '../state';
import { LEFT, RIGHT, SQUARE_SIZE } from '../getters';

@Component
export default class OutputTube extends PartComponent {
  static flows(): AngledFlows {
    return {
      [LEFT]: [{ angleOut: RIGHT, pressure: 0 }],
    };
  }

  get paths() {
    return {
      borders: [
        'M0,21 H20',
        'M0,29 H20',
      ],
      liquid: 'M0,25 H20',
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="40.5,17.5 48,25 40.5,32.5"/>
      <polyline points="36.4,19.3 42.1,25 36.4,30.8"/>
      <polyline points="32.3,21 36.3,25 32.3,29"/>
      <path :d="paths.borders[0]"/>
      <path :d="paths.borders[1]"/>
    </g>
    <g class="liquid" v-if="liquid" :stroke="liquidColor">
      <path :d="paths.liquid"/>
    </g>
    <AnimatedArrows v-if="flowing" :path="paths.borders[0]" :numArrows="1" :duration="1"/>
  </SVGRoot>
</template>


<style scoped>
</style>
