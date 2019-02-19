<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { RIGHT } from '../getters';

@Component
export default class Valve extends PartComponent {
  get flowSpeed() {
    return this.flow[RIGHT];
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
      <g key="valve-inner" :transform="`rotate(${closed ? '90' : '0'})`" class="fill outline inner">
        <g transform="translate(-25, -25)">
          <path d="M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z"/>
          <path d="M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z"/>
        </g>
      </g>
    </g>
    <AnimatedArrows v-if="flowSpeed" key="valve-arrows" :speed="flowSpeed" path="M0,25H50"/>
    <rect fill="red" fill-opacity="0" x="0" y="0" width="50" height="50"/>
  </g>
</template>


<style scoped>
.ProcessViewPart {
  cursor: pointer;
}
</style>
