<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import { clampRotation } from '@/helpers/functional';
import { Coordinates } from '@/helpers/coordinates';
import settings from '../settings';

@Component
export default class PlacementPartCard extends PartCard {
  rotate(rotation: number) {
    const partSize = settings[this.part.type].size(this.part);
    const rotate = clampRotation(this.part.rotate + rotation);

    const updated = new Coordinates(this.part)
      .rotateSquare(rotation, this.part.rotate, partSize)
      .raw();

    this.savePart({ ...this.part, ...updated, rotate });
  }

  flip() {
    this.savePart({ ...this.part, flipped: !this.part.flipped });
  }
}
</script>

<template>
  <q-item dark>
    <q-item-section side>Placement</q-item-section>
    <q-item-section>
      <q-btn fab round color="primary" icon="rotate_left" @click="rotate(-90)"/>
    </q-item-section>
    <q-item-section>
      <q-btn fab round color="primary" icon="rotate_right" @click="rotate(90)"/>
    </q-item-section>
    <q-item-section>
      <q-btn fab round color="primary" icon="mdi-swap-horizontal-bold" @click="flip"/>
    </q-item-section>
    <q-item-section>
      <q-btn fab round color="primary" icon="delete" @click="removePart"/>
    </q-item-section>
  </q-item>
</template>
