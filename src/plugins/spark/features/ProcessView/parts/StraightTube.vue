<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { Transitions } from '../state';
import { LEFT, RIGHT, SQUARE_SIZE } from '../getters';

@Component
export default class StraightTube extends PartComponent {
  static transitions(): Transitions {
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT }],
    };
  }

  get reversed() {
    return this.flowOnAngle(RIGHT) > 0;
  }

  get paths() {
    return {
      borders: [
        'M 50,29 H 0',
        'M 50,21 H 0',
      ],
      liquid: 'M 50,25 H 0',
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
    <AnimatedArrows v-if="flowing" :reversed="reversed" :path="paths.borders[0]"/>
  </SVGRoot>
</template>


