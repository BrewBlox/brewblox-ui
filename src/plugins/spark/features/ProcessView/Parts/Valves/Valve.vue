<script lang="ts">
import Component from 'vue-class-component';
import FlowArrow from '../Flows/FlowArrow.vue';
import PartComponent from '../PartComponent';
import SVGRoot from '../SVGRoot.vue';
import { DisplayPart } from '../../state';

@Component({
  components: {
    SVGRoot,
    FlowArrow,
  },
})
export default class Valve extends PartComponent {
  static flows(part: DisplayPart) {
    if (part.closed) {
      return {};
    }

    return {
      270: [{ angleOut: 90, friction: 1 }],
      90: [{ angleOut: 270, friction: 1 }],
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
  <button type="button" v-on:click="toggleClosed">
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
  </button>
</template>


<style scoped>
.ProcessViewPart {
  cursor: pointer;
}

button {
  border: 0;
  background: none;
  outline: none;
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
