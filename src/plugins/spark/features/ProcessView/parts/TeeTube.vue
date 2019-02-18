<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { Transitions } from '../state';
import { UP, LEFT, RIGHT, DOWN, SQUARE_SIZE } from '../getters';

@Component
export default class TeeTube extends PartComponent {
  static transitions(): Transitions {
    return {
      [UP]: [{ outCoords: RIGHT }, { outCoords: LEFT }],
      [RIGHT]: [{ outCoords: UP }, { outCoords: LEFT }],
      [LEFT]: [{ outCoords: UP }, { outCoords: RIGHT }],
    };
  }

  get paths() {
    return {
      top: 'M25,25 V0',
      left: 'M25,25 H0',
      right: 'M25,25 H50',
    };
  }

  get topSpeed() {
    return this.flowOnAngle(UP);
  }

  get leftSpeed() {
    return this.flowOnAngle(LEFT);
  }
  get rightSpeed() {
    return this.flowOnAngle(RIGHT);
  }
}
</script>

<template>
  <g class="tee-tube">
    <g class="outline">
      <path d="M50,21H30a1,1,0,0,1-1-1V0"/>
      <path d="M21,0V20a1,1,0,0,1-1,1H0"/>
      <line class="line" y1="29" x2="50" y2="29"/>
    </g>
    <g v-if="liquid" :stroke="liquidColor" class="liquid">
      <line y1="25" x2="50" y2="25"/>
      <path d="M0,25H20a5,5,0,0,0,5-5V0"/>
      <path d="M25,0V20a5,5,0,0,0,5,5H50"/>
    </g>
    <g class="outline">
      <AnimatedArrows
        v-if="topSpeed"
        :path="paths.top"
        :num-arrows="1"
        :speed="topSpeed"
      />
      <AnimatedArrows
        v-if="leftSpeed"
        :path="paths.left"
        :num-arrows="1"
        :speed="leftSpeed"
      />
      <AnimatedArrows
        v-if="rightSpeed"
        :path="paths.right"
        :num-arrows="1"
        :speed="rightSpeed"
      />
    </g>
  </g>
</template>


