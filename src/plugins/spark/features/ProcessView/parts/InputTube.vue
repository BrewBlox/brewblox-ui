<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { LEFT, RIGHT, SQUARE_SIZE } from '../getters';
import { clamp } from '@/helpers/functional';

@Component
export default class InputTube extends PartComponent {
  static get isSource() {
    return true;
  }

  static flows(): AngledFlows {
    return {
      [LEFT]: [{ angleOut: RIGHT }],
    };
  }

  get flowing() {
    return this.flowOnAngle(RIGHT) > 0;
  }

  get paths() {
    return {
      borders: [
        'M30,21 H50',
        'M30,29 H50',
      ],
      liquid: 'M30,25 H50',
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="1.25 17.5 8.75 25 1.25 32.5"/>
      <polyline points="9.13 19.25 14.88 25 9.13 30.75"/>
      <polyline points="17 21 21 25 17 29"/>
      <path :d="paths.borders[0]"/>
      <path :d="paths.borders[1]"/>
    </g>
    <g v-if="liquid" :stroke="liquidColor" class="liquid">
      <path :d="paths.liquid"/>
    </g>
    <AnimatedArrows v-if="flowing" :path="paths.borders[0]" :num-arrows="1" :duration="1"/>
  </SVGRoot>
</template>


<style scoped>
</style>
