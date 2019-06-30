<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartComponent from '../components/PartComponent';


@Component
export default class SetpointDisplay extends PartComponent { }
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
