<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartComponent from '../components/PartComponent';

@Component
export default class Kettle extends PartComponent {
}
</script>

<template>
  <g class="kettle">
    <g class="text">
      <text x="10" y="30">50L</text>
    </g>
    <g class="outline">
      <rect
        :width="SQUARE_SIZE*sizeX-4"
        :height="SQUARE_SIZE*sizeY-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
    </g>
  </g>
</template>
