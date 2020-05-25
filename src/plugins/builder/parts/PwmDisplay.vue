<script lang="ts">
import { Component } from 'vue-property-decorator';

import PartBase from '../components/PartBase';
import { CENTER } from '../getters';


@Component
export default class PwmDisplay extends PartBase {

  get color(): string {
    return this.liquidOnCoord(CENTER)[0] ?? '';
  }
}
</script>

<template>
  <PwmValues :part="part" settings-key="pwm" :color="color" />
</template>
