<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { LEFT, RIGHT, UP } from '../getters';

@Component
export default class TeeTube extends PartBase {
  get paths() {
    return {
      top: 'M25,25 V0',
      left: 'M25,25 H0',
      right: 'M25,25 H50',
    };
  }

  get topSpeed() {
    return this.flowOnCoord(UP);
  }

  get leftSpeed() {
    return this.flowOnCoord(LEFT);
  }

  get rightSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get topLiquids() {
    return this.liquidOnCoord(UP);
  }

  get leftLiquids() {
    return this.liquidOnCoord(LEFT);
  }

  get rightLiquids() {
    return this.liquidOnCoord(RIGHT);
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <path d="M0,21H21V0"/>
      <path d="M50,21H29V0"/>
      <path d="M0,29H50"/>
    </g>
    <LiquidStroke :paths="['M25,22V0']" :colors="topLiquids"/>
    <LiquidStroke :paths="['M0,25H25']" :colors="leftLiquids"/>
    <LiquidStroke :paths="['M25,25H50']" :colors="rightLiquids"/>
    <g class="outline">
      <AnimatedArrows :path="paths.top" :num-arrows="1" :speed="topSpeed"/>
      <AnimatedArrows :path="paths.left" :num-arrows="1" :speed="leftSpeed"/>
      <AnimatedArrows :path="paths.right" :num-arrows="1" :speed="rightSpeed"/>
    </g>
  </g>
</template>
