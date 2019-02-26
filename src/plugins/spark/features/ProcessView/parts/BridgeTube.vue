<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { LEFT, RIGHT, DOWN, UP } from '../getters';

@Component
export default class BridgeTube extends PartComponent {
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

  get lowFlowSpeed() {
    return this.flow[UP];
  }

  get highFlowSpeed() {
    return this.flow[LEFT];
  }

  get lowPaths() {
    return {
      borders: [
        'M 21,50 V 0',
        'M 29,50 V 0',
      ],
      liquid: 'M 25,50 V 0',
    };
  }

  get highPaths() {
    return {
      borders: [
        [
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
        [
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
      ],
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
  <g class="bridge-tube">
    <!-- low -->
    <g class="outline">
      <path :d="lowPaths.borders[0]"/>
      <path :d="lowPaths.borders[1]"/>
    </g>
    <LiquidStroke :paths="[lowPaths.liquid]" :colors="liquidColor"/>
    <AnimatedArrows v-if="lowFlowSpeed && hasLiquid" :speed="lowFlowSpeed" :path="lowPaths.liquid"/>
    <!-- high -->
    <g class="outline">
      <path :d="highPaths.borders[0]"/>
      <path :d="highPaths.borders[1]"/>
    </g>
    <LiquidStroke :paths="[highPaths.liquid]" :colors="liquidColor"/>
    <AnimatedArrows
      v-if="highFlowSpeed && hasLiquid"
      :speed="highFlowSpeed"
      :path="highPaths.liquid"
    />
  </g>
</template>


