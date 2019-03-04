<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import { clampRotation } from '@/helpers/functional';

@Component
export default class PlacementPartCard extends PartCard {
  rotate(rotation: number) {
    const rotate = clampRotation(this.part.rotate + rotation);
    this.savePart({ ...this.part, rotate });
  }

  flip() {
    this.savePart({ ...this.part, flipped: !this.part.flipped });
  }
}
</script>

<template>
  <q-card>
    <q-card-title>Placement</q-card-title>
    <q-card-main>
      <div class="row justify-around">
        <q-btn fab round color="primary" icon="rotate_left" @click="rotate(-90)"/>
        <q-btn fab round color="primary" icon="rotate_right" @click="rotate(90)"/>
        <q-btn fab round color="primary" icon="mdi-swap-horizontal-bold" @click="flip"/>
        <q-btn fab round color="primary" icon="delete" @click="removePart"/>
      </div>
    </q-card-main>
  </q-card>
</template>
