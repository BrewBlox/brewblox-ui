<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { colorString } from '../helpers';
import { DEFAULT_SIZE_X, DEFAULT_SIZE_Y } from '../specs/Carboy';

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

  get color(): string {
    return colorString(this.part.settings.color);
  }

  get scaleX(): number {
    return this.sizeX / DEFAULT_SIZE_X;
  }

  get scaleY(): number {
    return this.sizeY / DEFAULT_SIZE_Y;
  }

  get valueY(): number {
    return Math.round(this.sizeY / 4);
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
      <path
        :d="path"
        :transform="`scale(${scaleX} ${scaleY})`"
      />
      <SetpointValues
        :part="part"
        :start-y="valueY"
        :background-color="color"
        hide-unset
      />
    </g>
  </g>
</template>
