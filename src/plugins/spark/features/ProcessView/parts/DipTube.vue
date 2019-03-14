<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { LEFT } from '../getters';

@Component
export default class DipTube extends PartComponent {
  get paths() {
    return {
      borders: [
        'M29,40V30a9,9,0,0,0-9-9H0',
        'M21,40V32a3,3,0,0,0-3-3H0',
      ],
      liquid: 'M0,25H20a5,5,0,0,1,5,5V40',
    };
  }

  get flowSpeed() {
    return -this.flowOnCoord(LEFT);
  }

  get liquids() {
    return this.liquidOnCoord(LEFT);
  }
}
</script>

<template>
  <g class="dip-tube">
    <g class="outline">
      <rect fill="white" y="12.5" width="8" height="8"/>
      <rect fill="white" y="30" width="8" height="8"/>
      <path v-for="border in paths.borders" :key="border" :d="border"/>
    </g>
    <LiquidStroke :paths="[paths.liquid]" :colors="liquids"/>
    <AnimatedArrows :speed="flowSpeed" :path="paths.liquid"/>
  </g>
</template>
