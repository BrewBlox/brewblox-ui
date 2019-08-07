<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class Carboy extends PartBase {
  readonly path = `
    M89.2,199
    H10.8
    c-5.4,0-9.8-4.4-9.8-9.9
    V43.9
    c0-4.4,2.9-8.3,7-9.5
    l32.6-8.8
    V2
    h18.6
    v24.6
    L92,34.4
    c4.2,1.2,7,5.1,7,9.5
    v145.2
    C99,194.6,94.6,199,89.2,199
    z`;

  get color(): string | null {
    const color = this.part.settings.color;
    return color && !color.startsWith('#') ? `#${color}` : color;
  }
}
</script>

<template>
  <g>
    <rect
      :y="squares(1)"
      :width="squares(sizeX)"
      :height="squares(sizeY-1)-2"
      :fill="color"
      rx="8"
      ry="8"
    />
    <g class="outline">
      <path :d="path" />
      <SetpointValues :part="part" :start-y="1" :background-color="color" hide-unset />
    </g>
  </g>
</template>
