<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';

@Component
export default class HeatingElement extends PartBase {

  get path(): string {
    const straight = this.squares(this.sizeX - 2);
    return `M50,24.7h24c7.1,0,6.6-6.7,14-6.7 h${straight} c0,0,7,0.1,7,7 c0,7-7,7-7,7 H90`;
  }

}
</script>

<template>
  <g>
    <PwmValues :part="part" settings-key="pwm" />
    <g class="outline">
      <path :d="path" />
    </g>
  </g>
</template>
