<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartComponent from '../components/PartComponent';


@Component
export default class TallFridge extends PartComponent {
  get titleText(): string {
    return this.part.settings.text || '';
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <rect
        :width="squares(sizeX)-4"
        :height="squares(sizeY)-4"
        x="2"
        y="2"
        rx="8"
        ry="8"
        stroke-width="4px"
      />
      <line :x1="2" :y1="squares(1)" :x2="squares(sizeX)-4" :y2="squares(1)" />
      <line
        :x1="2"
        :y1="squares(sizeY-1)"
        :x2="squares(sizeX)-4"
        :y2="squares(sizeY-1)"
        stroke-width="4px"
      />
      <!-- Shelf -->
      <line
        v-if="sizeY >= 10"
        :x1="2"
        :y1="squares(sizeY/2)"
        :x2="squares(sizeX)-4"
        :y2="squares(sizeY/2)"
        stroke-width="4px"
      />
      <g>
        <foreignObject :width="squares(sizeX)" :height="squares(sizeY)">
          <div
            class="text-white text-bold text-center text-h6 q-mt-xs"
            style="max-width: 100%"
          >{{ titleText }}</div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
