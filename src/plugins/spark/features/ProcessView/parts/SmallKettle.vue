<script lang="ts">
import Component from 'vue-class-component';
import PartComponent from '../components/PartComponent';

@Component
export default class SmallKettle extends PartComponent {
}
</script>

<template>
  <g class="small-kettle">
    <g class="text">
      <text x="10" y="30">50L</text>
    </g>
    <g class="outline">
      <rect
        :width="SQUARE_SIZE*2-4"
        :height="SQUARE_SIZE*2-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
    </g>
  </g>
</template>
