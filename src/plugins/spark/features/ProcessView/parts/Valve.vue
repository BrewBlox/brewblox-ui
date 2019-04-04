<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { RIGHT } from '../getters';

@Component
export default class Valve extends PartComponent {

  get paths() {
    return {
      outerValve: [
        'M0,21h10.5c1.4-5.1,5.4-9.1,10.5-10.5C29,8.3,37.2,13,39.4,21h0.1H50',
        'M0,29h10.5h0C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29h0.1H50',
      ],
      innerValve: [
        'M39.4,21C37.2,13,29,8.3,21,10.5c-5.1,1.4-9.1,5.4-10.5,10.5H39.4z',
        'M10.5,29C12.7,37,21,41.6,29,39.4C34,38,38,34,39.4,29H10.5z',
      ],
      openLiquid: [
        'm0,25h50',
      ],
      closedLiquid: [
        'm0,25h19',
        'm31,25h50',
      ],
    };
  }

  get flowSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get liquids() {
    return this.liquidOnCoord(RIGHT);
  }

  get closed() {
    return Boolean(this.part.settings.closed);
  }

  protected toggleClosed(): void {
    this.$parent.$emit('input', { ...this.part, settings: { ...this.part.settings, closed: !this.closed } });
  }
}
</script>

<template>
  <g class="valve clickable" @click="toggleClosed">
    <g key="valve-outer" class="outline">
      <path :d="paths.outerValve[0]"/>
      <path :d="paths.outerValve[1]"/>
    </g>
    <LiquidStroke v-if="closed" :paths="paths.closedLiquid" :colors="liquids"/>
    <LiquidStroke v-else :paths="paths.openLiquid" :colors="liquids"/>
    <g
      key="valve-inner"
      :transform="`rotate(${closed ? '90' : '0'}, 25, 25)`"
      class="fill outline inner"
    >
      <path :d="paths.innerValve[0]"/>
      <path :d="paths.innerValve[1]"/>
    </g>
    <AnimatedArrows key="valve-arrows" :speed="flowSpeed" :path="paths.closedLiquid[0]"/>
  </g>
</template>
