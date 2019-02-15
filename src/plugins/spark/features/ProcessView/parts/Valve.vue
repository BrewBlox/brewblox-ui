<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { FlowPart, Transitions } from '../state';
import { LEFT, RIGHT, UP, SQUARE_SIZE } from '../getters';

@Component
export default class Valve extends PartComponent {
  static transitions(part: FlowPart): Transitions {
    if (part.closed) {
      return {};
    }
    return {
      [LEFT]: [{ outCoords: RIGHT }],
      [RIGHT]: [{ outCoords: LEFT }],
    };
  }

  get reversed() {
    return this.flowOnAngle(RIGHT) > 0;
  }

}
</script>

<template>
  <g class="valve clickable" @click="toggleClosed">
    <g key="valve-outer" class="outline">
      <path d="M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50"/>
      <path d="M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50"/>
    </g>
    <g v-if="liquid" key="liquid" :stroke="liquidColor" class="liquid">
      <line v-if="!closed" y1="25" x2="50" y2="25"/>
      <line v-if="closed" y1="25" x2="19" y2="25"/>
      <line v-if="closed" x1="31" y1="25" x2="50" y2="25"/>
    </g>
    <g transform="translate(25, 25)">
      <g
        key="valve-inner"
        :transform="`rotate(${closed ? '90' : '0'})`"
        class="fill outline inner"
      >
        <g transform="translate(-25, -25)">
          <path d="M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z"/>
          <path d="M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z"/>
        </g>
      </g>
    </g>
    <AnimatedArrows
      v-if="flowing && !closed"
      key="valve-arrows"
      :reversed="reversed"
      path="M50,29H0"
    />
  </g>
</template>


<style scoped>
.ProcessViewPart {
  cursor: pointer;
}
</style>
