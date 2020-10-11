<script lang="ts">
import { Component } from 'vue-property-decorator';

import { clampRotation } from '@/helpers/functional';

import PartCard from './PartCard';

@Component
export default class PlacementCard extends PartCard {
  rotate(rotation: number): void {
    const rotate = clampRotation(this.part.rotate + rotation);
    this.savePart({ ...this.part, rotate });
  }

  flip(): void {
    this.savePart({ ...this.part, flipped: !this.part.flipped });
  }
}
</script>

<template>
  <div class="row justify-between">
    <q-btn
      outline
      icon="mdi-rotate-left-variant"
      no-wrap
      label="rotate"
      @click="rotate(-90)"
    />
    <q-btn
      outline
      icon="mdi-rotate-right-variant"
      no-wrap
      label="rotate"
      @click="rotate(90)"
    />
    <q-btn
      outline
      :label="part.flipped ? 'unflip' : 'flip'"
      icon="mdi-swap-horizontal-bold"
      @click="flip"
    />
    <q-btn
      outline
      icon="delete"
      label="delete"
      @click="removePart"
    />
  </div>
</template>
