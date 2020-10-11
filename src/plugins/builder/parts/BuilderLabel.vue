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
    <SvgEmbedded
      :transform="textTransformation([sizeX, sizeY], false)"
      :width="squares(sizeX)"
      :height="squares(sizeY)"
    >
      <div
        class="col-auto text-bold full-width q-pa-sm"
        :style="{'font-size': `${fontSize}pt`}"
      >
        {{ text }}
      </div>
    </SvgEmbedded>
  </g>
</template>
