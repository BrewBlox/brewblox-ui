<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { clamp } from '@/helpers/functional';
import { AngledFlows } from '../state';
import { LEFT, RIGHT } from './';

@Component
export default class OutputTube extends PartComponent {
  static isSink = true;

  static flows(): AngledFlows {
    return {
      [LEFT]: [{ angleOut: RIGHT, pressure: 0, friction: 1 }],
    };
  }

  opacity(xPosition: number): number {
    const opacity = 1 - ((xPosition - 15) / 5);
    return clamp(opacity, 0, 1);
  }

  get arrow() {
    return {
      x: this.frame * 50,
      y: 23,
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <polyline points="40.5,17.5 48,25 40.5,32.5"/>
      <polyline points="36.4,19.3 42.1,25 36.4,30.8"/>
      <polyline points="32.3,21 36.3,25 32.3,29"/>
      <line x1="0" y1="21" x2="20" y2="21"/>
      <line x1="0" y1="29" x2="20" y2="29"/>
    </g>
    <g class="liquid" v-if="liquid" stroke="#4aa0ef">
      <line x1="0" y1="25" x2="20" y2="25"/>
    </g>
    <g v-if="flowing" class="outline">
      <FlowArrow :rotate="270" :opacity="opacity(arrow.x)" :x="arrow.x" :y="arrow.y"/>
      <FlowArrow :rotate="270" :opacity="opacity(arrow.x - 25)" :x="arrow.x - 25" :y="arrow.y"/>
      <FlowArrow :rotate="270" :opacity="opacity(arrow.x - 50)" :x="arrow.x - 50" :y="arrow.y"/>
    </g>
  </SVGRoot>
</template>


<style scoped>
</style>
