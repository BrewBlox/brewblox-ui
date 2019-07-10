<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';


@Component
export default class SetpointDisplay extends PartBase { }
</script>

<template>
  <g>
    <SetpointValues :part="part"/>
    <g class="outline">
      <rect
        :width="SQUARE_SIZE*sizeX-2"
        :height="SQUARE_SIZE*sizeY-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke-width="2px"
      />
    </g>
  </g>
</template>
