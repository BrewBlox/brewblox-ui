<script lang="ts">
import { computed, defineComponent } from 'vue';

import { CENTER } from '@/plugins/builder/const';


@Component
export default class PwmDisplay extends PartBase {
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
    <PwmValues :part="part" settings-key="pwm" :color="color" />
  </g>
</template>
