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
      top: 'M29,0 V24',
      left: 'M50,29 H28',
      right: 'M0,21 H21',
    };
  }

  get topFlowing() {
    return Boolean(this.flowOnAngle(UP));
  }

  get topReversed() {
    return this.flowOnAngle(UP) > 0;
  }

  get leftFlowing() {
    return Boolean(this.flowOnAngle(RIGHT));
  }

  get leftReversed() {
    return this.flowOnAngle(RIGHT) > 0;
  }

  get rightFlowing() {
    return Boolean(this.flowOnAngle(LEFT));
  }

  get rightReversed() {
    return this.flowOnAngle(LEFT) > 0;
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
        v-if="topFlowing"
        :path="paths.top"
        :reversed="topReversed"
        :num-arrows="1"
        :duration="1"
      />
      <AnimatedArrows
        v-if="leftFlowing"
        :path="paths.left"
        :reversed="leftReversed"
        :num-arrows="1"
        :duration="1"
      />
      <AnimatedArrows
        v-if="rightFlowing"
        :path="paths.right"
        :reversed="rightReversed"
        :num-arrows="1"
        :duration="1"
      />
    </g>
  </g>
</template>


