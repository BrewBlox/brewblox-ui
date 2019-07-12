<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class Kettle extends PartBase {
  get titleText(): string {
    return this.part.settings.text || '';
  }
}
</script>

<template>
  <g>
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
      <g>
        <foreignObject
          :transform="textTransformation([sizeX, sizeY], false)"
          :width="squares(sizeX)"
          :height="squares(sizeY)"
        >
          <div
            class="text-white text-bold text-center text-h6 q-mt-xs"
            style="max-width: 100%"
          >{{ titleText }}</div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
