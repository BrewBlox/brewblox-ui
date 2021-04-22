<script lang="ts">
import { computed, defineComponent } from 'vue';




@Component
export default class Fridge extends PartBase {
  get titleText(): string {
    return this.part.settings.text || '';
  }

  get shelfY(): number {
    return this.part.settings.shelfY || 1;
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
    </g>
    <SvgEmbedded
      :transform="textTransformation([sizeX, sizeY], false)"
      :width="squares(sizeX)"
      :height="squares(sizeY)"
    >
      <div class="col-auto text-bold text-center q-pt-sm full-width" style="font-size: 130%">
        {{ titleText }}
      </div>
    </SvgEmbedded>
  </g>
</template>
