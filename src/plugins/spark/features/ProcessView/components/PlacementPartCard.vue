<script lang="ts">
import PartCard from './PartCard';
import Component from 'vue-class-component';
import { clampRotation } from '@/helpers/functional';
import { component } from '../calculateFlows';
import { SQUARE_SIZE } from '../getters';

@Component
export default class PlacementPartCard extends PartCard {
  rotate(rotation: number) {
    const rotate = clampRotation(this.part.rotate + rotation);
    this.savePart({ ...this.part, rotate });
  }

  get itemStyle() {
    return {
      width: `${SQUARE_SIZE}px`,
      height: `${SQUARE_SIZE}px`,
      position: 'relative',
    };
  }
}
</script>

<template>
  <q-card>
    <q-card-title>Part</q-card-title>
    <q-card-main class="row justify-center">
      <div :style="itemStyle">
        <ProcessViewItem :value="part"/>
      </div>
    </q-card-main>
    <q-card-title>Placement</q-card-title>
    <q-card-main>
      <div class="row">
        <q-btn fab round color="primary" icon="rotate_right" @click="rotate(90)"/>
        <q-btn fab round color="primary" icon="rotate_left" @click="rotate(-90)"/>
        <q-btn fab round color="primary" icon="delete" @click="removePart"/>
      </div>
    </q-card-main>
  </q-card>
</template>

