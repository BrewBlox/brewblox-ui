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
     <line x1="4" y1="4" x2="4" y2="6" stroke="black" />
     <line x1="4" y1="6" x2="9" y2="13" stroke="black" />
     <line x1="9" y1="13" x2="14" y2="10" stroke="black" />
     <line x1="14" y1="10" x2="22" y2="13" stroke="black" />
     <line x1="22" y1="13" x2="22" y2="6" stroke="black" />
     <line x1="22" y1="6" x2="23" y2="4" stroke="black" />
     <line x1="23" y1="4" x2="4" y2="4" stroke="black" />
      <g>
        <foreignObject
          :transform="textTransformation([sizeX, sizeY], false)"
          :width="squares(sizeX)"
          :height="squares(sizeY)"
        >
          <div
            class="text-white text-bold text-center text-h6 q-mt-xs"
            style="max-width: 100%"line
          >
            {{ titleText }}
          </div>
        </foreignObject>
      </g>
    </g>
  </g>
</template>
