<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';


@Component
export default class Fridge extends PartBase {
  get titleText(): string {
    return this.part.settings.text || '';
  }

  get shelfY(): number {
    return this.part.settings.dividerY || 1;
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
      <!-- Top divider -->
      <line :x1="2" :y1="squares(1)" :x2="squares(sizeX)-4" :y2="squares(1)" />
      <!-- Bottom divider -->
      <line :x1="2" :y1="squares(sizeY-1)" :x2="squares(sizeX)-4" :y2="squares(sizeY-1)" />
      <!-- Shelf divider-->
      <line :x1="2" :y1="squares(shelfY)" :x2="squares(sizeX)-4" :y2="squares(shelfY)" />
      <g>
        <foreignObject
          :transform="textTransformation([sizeX, sizeY], false)"
          :width="squares(sizeX)"
          :height="squares(sizeY)"
        >
          <div
            class="text-white text-bold text-center q-mt-sm full-width"
            style="font-size: 130%"
          >
            {{ titleText }}
          </div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
