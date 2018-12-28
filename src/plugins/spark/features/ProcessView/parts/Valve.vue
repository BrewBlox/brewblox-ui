<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { FlowPart, AngledFlows } from '../state';
import { LEFT, RIGHT, UP, DOWN, SQUARE_SIZE } from '../getters';

@Component
export default class Valve extends PartComponent {
  static flows(part: FlowPart): AngledFlows {
    if (part.closed) {
      return {};
    }

    return {
      [LEFT]: [{ angleOut: RIGHT }],
      [RIGHT]: [{ angleOut: LEFT }],
    };
  }

  get direction() {
    return this.flowOnAngle(RIGHT) > 0 ? LEFT : RIGHT;
  }

  get arrow() {
    const x = this.frame * SQUARE_SIZE;
    return {
      x: this.direction === RIGHT ? (75 - x) - 8 : x,
      y: 23,
    };
  }
}
</script>

<template>
  <div class="clickable" @click="toggleClosed">
    <SVGRoot>
      <g class="outline">
        <path d="M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50"/>
        <path d="M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50"/>
      </g>
      <g class="liquid" v-if="liquid" stroke="#4aa0ef">
        <line v-if="!closed" y1="25" x2="50" y2="25"/>
        <line v-if="closed" y1="25" x2="19" y2="25"/>
        <line v-if="closed" x1="31" y1="25" x2="50" y2="25"/>
      </g>
      <g v-if="flowing && !closed" class="outline">
        <FlowArrow :rotate="direction" :x="arrow.x" :y="arrow.y"/>
        <FlowArrow :rotate="direction" :x="arrow.x - 50" :y="arrow.y"/>
        <FlowArrow :rotate="direction" :x="arrow.x + 25" :y="arrow.y"/>
        <FlowArrow :rotate="direction" :x="arrow.x - 25" :y="arrow.y"/>
      </g>
      <g :class="{ outline: true, fill: true, valve: true, closed }">
        <path d="M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z"/>
        <path d="M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z"/>
      </g>
    </SVGRoot>
  </div>
</template>


<style scoped>
.ProcessViewPart {
  cursor: pointer;
}

.valve {
  transform-origin: 50% 50%;
  transition: transform 0.5s ease;
  transform: rotate(0deg);
}

.closed {
  transform: rotate(90deg);
}
</style>
