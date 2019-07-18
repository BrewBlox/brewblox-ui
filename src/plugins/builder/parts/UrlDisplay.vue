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
        stroke="none"
      />
      <g>
        <foreignObject
          :transform="textTransformation([sizeX, sizeY], false)"
          :width="squares(sizeX)"
          :height="squares(sizeY)"
        >
          <div
            class="text-white text-bold text-center text-h6 q-mt-xs"
            style="max-width: 100%; text-decoration: underline"
          >{{ titleText }}</div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
