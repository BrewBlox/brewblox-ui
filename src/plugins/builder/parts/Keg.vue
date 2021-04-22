<script lang="ts">
import { computed, defineComponent } from 'vue';

import { colorString } from '@/plugins/builder/utils';



@Component
export default class Keg extends PartBase {
  readonly scaleKey = 'scale';

  get scale(): number {
    return this.settings[this.scaleKey] ?? 1;
  }

  get color(): string {
    return colorString(this.part.settings.color);
  }
}
</script>

<template>
  <g :transform="`scale(${scale} ${scale})`">
    <rect :fill="color" x="10" y="60" width="80" height="178" />
    <g class="outline">
      <rect x="10" y="237" width="80" height="11" />
      <rect x="10" y="27" width="80" height="220" />
      <rect x="25" y="35" width="50" height="8" rx="4" ry="4" />
      <rect x="10" y="27" width="80" height="23.8" />
      <SetpointValues :part="part" :start-y="2" :background-color="color" hide-unset />
    </g>
  </g>
</template>
