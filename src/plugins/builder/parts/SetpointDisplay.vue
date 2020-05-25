<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { CENTER } from '../getters';


@Component
export default class SetpointDisplay extends PartBase {
  readonly scaleKey = 'scale';

  get scale(): number {
    return this.settings[this.scaleKey] ?? 1;
  }

  get color(): string {
    return this.liquidOnCoord(CENTER)[0] ?? '';
  }
}
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <SetpointValues v-bind="{ part }" />
    <g class="outline">
      <rect
        :width="squares(2)-2"
        :height="squares(1)-2"
        :stroke="color"
        stroke-width="2px"
        x="1"
        y="1"
        rx="6"
        ry="6"
      />
    </g>
  </g>
</template>
