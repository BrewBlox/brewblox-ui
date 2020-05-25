<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { CENTER } from '../getters';


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
