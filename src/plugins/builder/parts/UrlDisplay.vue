<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class UrlDisplay extends PartBase {
  get url(): string {
    return this.part.settings.url || '';
  }

  get titleText(): string {
    return this.part.settings.text || this.url || 'Url Display';
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
        stroke="white"
      />
      <g>
        <foreignObject
          :transform="textTransformation([sizeX, sizeY], false)"
          :width="squares(sizeX)"
          :height="squares(sizeY)"
        >
          <div
            class="text-white text-bold text-center q-mt-sm grid-label full-width"
            style="text-decoration: underline; font-size: 130%"
          >
            {{ titleText }}
          </div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
