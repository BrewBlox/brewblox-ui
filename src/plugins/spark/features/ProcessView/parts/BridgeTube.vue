<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { LEFT, RIGHT, DOWN, UP, SQUARE_SIZE } from '../getters';

@Component
export default class BridgeTube extends PartComponent {
  static get isBridge() {
    return true;
  }

  static flows(): AngledFlows {
    return {
      // bridge (high)
      [LEFT]: [{ angleOut: RIGHT }],
      [RIGHT]: [{ angleOut: LEFT }],
      // straight (low)
      [UP]: [{ angleOut: DOWN }],
      [DOWN]: [{ angleOut: UP }],
    };
  }

  get lowReversed() {
    return this.flowOnAngle(DOWN) > 0;
  }

  get highReversed() {
    return this.flowOnAngle(RIGHT) > 0;
  }

  get lowLiquid(): boolean {
    return (this.flow[UP] || this.flow[DOWN]) !== undefined;
  }

  get highLiquid(): boolean {
    return (this.flow[LEFT] || this.flow[RIGHT]) !== undefined;
  }

  get lowFlowing(): boolean {
    return (this.flow[UP] || this.flow[DOWN] || 0) !== 0;
  }

  get highFlowing(): boolean {
    return (this.flow[LEFT] || this.flow[RIGHT] || 0) !== 0;
  }

  get lowPaths() {
    return {
      border1: 'M 21,50 V 0',
      border2: 'M 29,50 V 0',
      liquid: 'M 25,50 V 0',
    };
  }

  get highPaths() {
    return {
      border1: [
        'M50,29',
        'H39',
        'a7.69,7.69,0,0,1-6-3.46',
        'l-1-1.9',
        'A7.87,7.87,0,0,0,26,20',
        'H24',
        'a7.87,7.87,0,0,0-6,3.63',
        'l-1,1.82',
        'A7.78,7.78,0,0,1,11,29',
        'H0',
      ].join(''),
      border2: [
        'M0,21',
        'H6.5',
        'a7.67,7.67,0,0,0,6-3.47',
        'l1-1.9',
        'a7.86,7.86,0,0,1,6-3.64',
        'H30.62',
        'a7.87,7.87,0,0,1,6,3.63',
        'l1,1.82',
        'a7.78,7.78,0,0,0,6,3.55',
        'H50',
      ].join(''),
      liquid: [
        'M50,25',
        'H41.31',
        'a7.69,7.69,0,0,1-6-3.46',
        'l-1-1.73',
        'a7.69,7.69,0,0,0-6-3.46',
        'H21.69',
        'a7.69,7.69,0,0,0-6,3.46',
        'l-1,1.73',
        'a7.69,7.69,0,0,1-6,3.46',
        'H0',
      ].join(''),
    };
  }
}
</script>

<template>
  <SVGRoot>
    <!-- low -->
    <g class="outline">
      <path :d="lowPaths.border1"/>
      <path :d="lowPaths.border2"/>
    </g>
    <g class="liquid" v-if="lowLiquid" stroke="#4aa0ef">
      <path :d="lowPaths.liquid"/>
    </g>
    <AnimatedArrows v-if="lowFlowing" :reversed="lowReversed" :path="lowPaths.border1"/>
    <!-- high -->
    <g class="outline">
      <path :d="highPaths.border1"/>
      <path :d="highPaths.border2"/>
    </g>
    <g class="liquid" v-show="highLiquid" stroke="#4aa0ef">
      <path :d="highPaths.liquid"/>
    </g>
    <AnimatedArrows v-if="highFlowing" :reversed="highReversed" :path="highPaths.border1"/>
  </SVGRoot>
</template>


<style scoped>
</style>
