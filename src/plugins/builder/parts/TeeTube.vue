<script lang="ts">
import { computed, defineComponent } from 'vue';

import { LEFT, RIGHT, UP } from '@/plugins/builder/const';


@Component
export default class TeeTube extends PartBase {
  readonly paths = {
    top: 'M25,25 V0',
    left: 'M25,25 H0',
    right: 'M25,25 H50',
  };

  get topSpeed(): number {
    return this.flowOnCoord(UP);
  }

  get leftSpeed(): number {
    return this.flowOnCoord(LEFT);
  }

  get rightSpeed(): number {
    return this.flowOnCoord(RIGHT);
  }

  get topLiquids(): string[] {
    return this.liquidOnCoord(UP);
  }

  get leftLiquids(): string[] {
    return this.liquidOnCoord(LEFT);
  }

  get rightLiquids(): string[] {
    return this.liquidOnCoord(RIGHT);
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <path d="M0,21H21V0" />
      <path d="M50,21H29V0" />
      <path d="M0,29H50" />
    </g>
    <LiquidStroke :paths="['M25,22V0']" :colors="topLiquids" />
    <LiquidStroke :paths="['M0,25H25']" :colors="leftLiquids" />
    <LiquidStroke :paths="['M25,25H50']" :colors="rightLiquids" />
    <g class="outline">
      <AnimatedArrows :path="paths.top" :num-arrows="1" :speed="topSpeed" />
      <AnimatedArrows :path="paths.left" :num-arrows="1" :speed="leftSpeed" />
      <AnimatedArrows :path="paths.right" :num-arrows="1" :speed="rightSpeed" />
    </g>
  </g>
</template>
