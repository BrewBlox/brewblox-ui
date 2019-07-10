<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class LargeKettle extends PartBase {
}
</script>

<template>
  <g>
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
