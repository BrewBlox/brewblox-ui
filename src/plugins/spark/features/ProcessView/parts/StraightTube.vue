<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { AngledFlows } from '../state';
import { LEFT, RIGHT } from './';

@Component
export default class StraightTube extends PartComponent {
  static flows(): AngledFlows {
    return {
      [LEFT]: [{ angleOut: RIGHT, friction: 1 }],
      [RIGHT]: [{ angleOut: LEFT, friction: 1 }],
    };
  }

  get direction() {
    return this.flowOnAngle(90) > 0 ? 270 : 90;
  }

  get arrow() {
    const x = this.frame * 50;

    return {
      x: this.direction === 90 ? (75 - x) - 8 : x,
      y: 23,
    };
  }
}
</script>

<template>
  <SVGRoot>
    <g class="outline">
      <line y1="21" x2="50" y2="21"/>
      <line y1="29" x2="50" y2="29"/>
    </g>
    <g class="liquid" v-if="liquid" stroke="#4aa0ef">
      <line y1="25" x2="50" y2="25"/>
    </g>
    <g v-if="flowing" class="outline">
      <FlowArrow :rotate="direction" :x="arrow.x" :y="arrow.y"/>
      <FlowArrow :rotate="direction" :x="arrow.x - 50" :y="arrow.y"/>
      <FlowArrow :rotate="direction" :x="arrow.x + 25" :y="arrow.y"/>
      <FlowArrow :rotate="direction" :x="arrow.x - 25" :y="arrow.y"/>
    </g>
  </SVGRoot>
</template>


<style scoped>
</style>
