<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { Transitions } from '../state';
import { UP, RIGHT, SQUARE_SIZE, LEFT } from '../getters';

@Component
export default class ElbowTube extends PartComponent {
  static transitions(): Transitions {
    return {
      [UP]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: UP }],
    };
  }

  get reversed() {
    return this.flowOnAngle(UP) > 0;
  }

  get paths() {
    return {
      borders: [
        'M21,0v20c0,5,4,9,9,9h20',
        'M29,0v18c0,1.7,1.3,3,3,3h18',
      ],
      liquid: 'M25,0V20a5,5,0,0,0,5,5H50',
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <path :d="paths.borders[0]"/>
      <path :d="paths.borders[1]"/>
    </g>
    <g v-if="liquid" :stroke="liquidColor" class="liquid">
      <path :d="paths.liquid"/>
    </g>
    <AnimatedArrows v-if="flowing" :reversed="reversed" :path="paths.borders[1]"/>
  </SVGRoot>
</template>


