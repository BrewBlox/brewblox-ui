<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';
import { RIGHT } from '../getters';

@Component
export default class Kettle extends PartComponent {
  get paths() {
    return {
      borders: [
        'M 0,0 H 200 V 300 H 0 V 0',
      ],
      liquid: 'M 0,25 H 50',
    };
  }

  get flowSpeed() {
    return this.flowOnCoord(RIGHT);
  }

  get liquids() {
    return this.liquidOnCoord(RIGHT);
  }
}
</script>

<template>
  <g class="kettle">
    <g class="outline">
      <path :d="paths.borders[0]"/>
    </g>
  </g>
</template>
