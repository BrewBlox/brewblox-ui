<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { LEFT } from '../getters';

@Component
export default class OutputTube extends PartComponent {
  get paths() {
    return {
      borders: [
        'M0,21 H20',
        'M0,29 H20',
      ],
      liquid: 'M0,25 H20',
    };
  }

  get flowSpeed() {
    return -this.flow[LEFT];
  }
}
</script>

<template>
  <g class="ouput-tube">
    <g class="outline">
      <polyline points="40.5,17.5 48,25 40.5,32.5"/>
      <polyline points="36.4,19.3 42.1,25 36.4,30.8"/>
      <polyline points="32.3,21 36.3,25 32.3,29"/>
      <path :d="paths.borders[0]"/>
      <path :d="paths.borders[1]"/>
    </g>
    <g v-if="liquid" :stroke="liquidColor" class="liquid">
      <path :d="paths.liquid"/>
    </g>
    <AnimatedArrows v-if="flowSpeed" :num-arrows="1" :speed="flowSpeed" path="M0,25H25"/>
  </g>
</template>


