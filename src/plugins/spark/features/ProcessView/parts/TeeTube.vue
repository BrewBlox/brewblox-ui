<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { UP, LEFT, RIGHT } from '../getters';

@Component
export default class TeeTube extends PartComponent {
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
      <path d="M0,21H21V0"/>
      <path d="M50,21H29V0"/>
      <path d="M0,29H50"/>
    </g>
    <LiquidStroke :paths="['M0,25H50', 'M25,22V0']" :colors="liquidColor"/>
    <g v-if="hasLiquid" class="outline">
      <AnimatedArrows :path="paths.top" :num-arrows="1" :speed="topSpeed"/>
      <AnimatedArrows :path="paths.left" :num-arrows="1" :speed="leftSpeed"/>
      <AnimatedArrows :path="paths.right" :num-arrows="1" :speed="rightSpeed"/>
    </g>
  </g>
</template>


