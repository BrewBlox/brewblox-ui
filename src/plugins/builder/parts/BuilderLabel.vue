<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class BuilderLabel extends PartBase {
  get text(): string {
    return this.part.settings.text || '<edit to set text>';
  }

  get fontSize(): number {
    return this.part.settings.fontSize || 16;
  }
}
</script>

<template>
  <g>
    <g class="outline">
      <rect
        :width="squares(sizeX)-2"
        :height="squares(sizeY)-2"
        x="1"
        y="1"
        rx="6"
        ry="6"
        stroke="none"
      />
      <g>
        <foreignObject
          :transform="textTransformation([sizeX, sizeY], false)"
          :width="squares(sizeX)"
          :height="squares(sizeY)"
        >
          <div
            :style="{
              'max-width': '100%',
              'font-size': `${fontSize}pt`,
            }"
            class="text-white text-bold"
          >
            {{ text }}
          </div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
