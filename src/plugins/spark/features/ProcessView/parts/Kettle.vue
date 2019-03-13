<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';

@Component
export default class Kettle extends PartComponent {
  get paths() {
    return {
      borders: [
        'M 50,0 H 150 l 50,50 V 250 l -50,50 H 50 l -50,-50 V 50 l 50,-50',
      ],
      liquid: '',
    };
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
